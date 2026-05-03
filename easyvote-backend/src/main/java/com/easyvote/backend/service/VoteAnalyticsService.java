package com.easyvote.backend.service;

import com.easyvote.backend.dto.vote.CandidateVoteResult;
import com.easyvote.backend.dto.vote.ElectionResultsResponse;
import com.easyvote.backend.dto.vote.ElectionStatsResponse;
import com.easyvote.backend.dto.vote.HourlyVoteStat;
import com.easyvote.backend.dto.vote.PublicStatsResponse;
import com.easyvote.backend.entity.Candidate;
import com.easyvote.backend.entity.Election;
import com.easyvote.backend.entity.Vote;
import com.easyvote.backend.entity.enums.CandidateStatus;
import com.easyvote.backend.entity.enums.ElectionStatus;
import com.easyvote.backend.exception.BusinessException;
import com.easyvote.backend.exception.ResourceNotFoundException;
import com.easyvote.backend.repository.CandidateRepository;
import com.easyvote.backend.repository.ElectionRepository;
import com.easyvote.backend.repository.UserRepository;
import com.easyvote.backend.repository.VoteRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.easyvote.backend.security.UserPrincipal;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VoteAnalyticsService {

    private final VoteRepository voteRepository;
    private final ElectionRepository electionRepository;
    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;

    // ── 1. Obtenir les résultats de l'élection ─────────────────
    @Transactional(readOnly = true)
    public ElectionResultsResponse getResults(Long electionId) {
        Election election = electionRepository.findById(electionId)
                .orElseThrow(() -> new ResourceNotFoundException("Election", "id", electionId));

        if (election.getStatus() != ElectionStatus.VOTE_ACTIVE && election.getStatus() != ElectionStatus.CLOSED) {
            throw new BusinessException("Les résultats sont indisponibles pour le moment");
        }

        if (election.getStatus() == ElectionStatus.VOTE_ACTIVE) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean isAdmin = auth != null && auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (!isAdmin) {
                throw new BusinessException("Les résultats détaillés seront disponibles à la clôture du vote");
            }
        }

        List<Candidate> candidates = candidateRepository.findByElectionIdAndStatus(electionId, CandidateStatus.VALIDATED);
        
        long totalVotes = voteRepository.countByElectionId(electionId);
        long totalEligibleVoters = userRepository.countByIsVerifiedTrue();
        double participationRate = totalEligibleVoters > 0 ? ((double) totalVotes / totalEligibleVoters) * 100.0 : 0.0;

        List<CandidateVoteResult> results = new ArrayList<>();
        for (Candidate candidate : candidates) {
            long votes = voteRepository.countByElectionIdAndCandidateId(electionId, candidate.getId());
            double percentage = totalVotes > 0 ? ((double) votes / totalVotes) * 100.0 : 0.0;

            results.add(CandidateVoteResult.builder()
                    .candidateId(candidate.getId())
                    .fullName(candidate.getUser().getFullName())
                    .slogan(candidate.getSlogan())
                    .photoUrl(candidate.getPhotoUrl())
                    .votes(votes)
                    .percentage(percentage)
                    .build());
        }

        // Trier par nombre de votes DESC
        results.sort(Comparator.comparing(CandidateVoteResult::getVotes).reversed());

        // Assigner les rangs
        int rank = 1;
        for (CandidateVoteResult result : results) {
            result.setRank(rank++);
        }

        return ElectionResultsResponse.builder()
                .electionId(election.getId())
                .electionTitle(election.getTitle())
                .status(election.getStatus())
                .totalVotes(totalVotes)
                .totalEligibleVoters(totalEligibleVoters)
                .participationRate(participationRate)
                .results(results)
                .computedAt(LocalDateTime.now())
                .isFinal(election.getStatus() == ElectionStatus.CLOSED)
                .build();
    }

    // ── 1b. Stats publiques (pas de classement par candidat) ─────
    @Transactional(readOnly = true)
    public PublicStatsResponse getPublicStats(Long electionId) {
        Election election = electionRepository.findById(electionId)
                .orElseThrow(() -> new ResourceNotFoundException("Election", "id", electionId));

        long totalVotes = voteRepository.countByElectionId(electionId);
        long totalEligibleVoters = userRepository.countByIsVerifiedTrue();
        double participationRate = totalEligibleVoters > 0 ? ((double) totalVotes / totalEligibleVoters) * 100.0 : 0.0;

        return PublicStatsResponse.builder()
                .electionId(election.getId())
                .electionTitle(election.getTitle())
                .status(election.getStatus())
                .totalVotes(totalVotes)
                .totalEligibleVoters(totalEligibleVoters)
                .participationRate(participationRate)
                .updatedAt(LocalDateTime.now())
                .build();
    }

    // ── 2. Statistiques en temps réel pour l'admin ─────────────
    @Transactional(readOnly = true)
    public ElectionStatsResponse getLiveStats(Long electionId) {
        Election election = electionRepository.findById(electionId)
                .orElseThrow(() -> new ResourceNotFoundException("Election", "id", electionId));

        if (election.getStatus() != ElectionStatus.VOTE_ACTIVE && election.getStatus() != ElectionStatus.CLOSED) {
            throw new BusinessException("Statistiques indisponibles (élection non active)");
        }

        ElectionResultsResponse results = getResults(electionId);
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime hourAgo = now.minusHours(1);

        List<Vote> votes = voteRepository.findByElectionId(electionId);
        
        long votesLastHour = votes.stream()
                .filter(v -> v.getVotedAt().isAfter(hourAgo))
                .count();

        // Répartition horaire des 24 dernières heures
        Map<String, Long> hourlyCounts = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:00");
        
        for (int i = 23; i >= 0; i--) {
            LocalDateTime h = now.minusHours(i);
            hourlyCounts.put(h.format(formatter), 0L);
        }

        for (Vote v : votes) {
            if (v.getVotedAt().isAfter(now.minusHours(24))) {
                String key = v.getVotedAt().format(formatter);
                hourlyCounts.put(key, hourlyCounts.getOrDefault(key, 0L) + 1);
            }
        }

        List<HourlyVoteStat> hourlyDistribution = hourlyCounts.entrySet().stream()
                .map(e -> new HourlyVoteStat(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        List<CandidateVoteResult> top5 = results.getResults().stream()
                .limit(5)
                .collect(Collectors.toList());

        return ElectionStatsResponse.builder()
                .electionId(electionId)
                .totalVotes(results.getTotalVotes())
                .totalEligibleVoters(results.getTotalEligibleVoters())
                .participationRate(results.getParticipationRate())
                .votesLastHour(votesLastHour)
                .hourlyDistribution(hourlyDistribution)
                .currentRanking(top5)
                .updatedAt(now)
                .build();
    }

    // ── 3. Exporter les résultats en PDF ───────────────────────
    @Transactional(readOnly = true)
    public byte[] exportResultsToPdf(Long electionId) {
        ElectionResultsResponse response = getResults(electionId);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

            Paragraph title = new Paragraph("EasyVote - Résultats : " + response.getElectionTitle(), titleFont);
            title.setAlignment(Paragraph.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            document.add(new Paragraph("Généré le : " + LocalDateTime.now().format(formatter), normalFont));
            document.add(new Paragraph("Statut : " + (response.isFinal() ? "Définitif" : "Provisoire"), normalFont));
            document.add(new Paragraph("Total des votes : " + response.getTotalVotes(), normalFont));
            document.add(new Paragraph("Taux de participation : " + String.format("%.2f", response.getParticipationRate()) + "%", normalFont));
            document.add(new Paragraph(" ")); // spacing

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1f, 4f, 2f, 2f});

            addCellToTable(table, "Rang", headerFont);
            addCellToTable(table, "Candidat", headerFont);
            addCellToTable(table, "Votes", headerFont);
            addCellToTable(table, "Pourcentage", headerFont);

            for (CandidateVoteResult res : response.getResults()) {
                Font rowFont = res.getRank() == 1 ? headerFont : normalFont;
                addCellToTable(table, String.valueOf(res.getRank()), rowFont);
                addCellToTable(table, res.getFullName(), rowFont);
                addCellToTable(table, String.valueOf(res.getVotes()), rowFont);
                addCellToTable(table, String.format("%.2f %%", res.getPercentage()), rowFont);
            }

            document.add(table);
            
            document.add(new Paragraph(" ")); // spacing
            Paragraph footer = new Paragraph("Document généré automatiquement par la plateforme EasyVote.", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10));
            footer.setAlignment(Paragraph.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate PDF for election {}", electionId, e);
            throw new BusinessException("Erreur lors de la génération du PDF");
        }
    }

    private void addCellToTable(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(8);
        table.addCell(cell);
    }
}
