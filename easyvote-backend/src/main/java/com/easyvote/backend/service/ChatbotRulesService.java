package com.easyvote.backend.service;

import com.easyvote.backend.entity.Candidate;
import com.easyvote.backend.entity.Election;
import com.easyvote.backend.entity.enums.CandidateStatus;
import com.easyvote.backend.entity.enums.ElectionStatus;
import com.easyvote.backend.repository.CandidateRepository;
import com.easyvote.backend.repository.ElectionRepository;
import com.easyvote.backend.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotRulesService {

    private final ElectionRepository electionRepository;
    private final CandidateRepository candidateRepository;
    private final VoteRepository voteRepository;

    public Optional<String> tryMatchRule(String userMessage, Long currentUserId) {
        String normalizedMsg = normalize(userMessage);

        if (matches(normalizedMsg, "bonjour", "salut", "hello", "hi", "hey", "coucou", "bonsoir")) {
            return Optional.of("Bonjour ! 👋 Je suis l'assistant EasyVote. Je peux vous renseigner sur les élections, candidats, dates, modalités de vote. Comment puis-je vous aider ?");
        }

        if (matches(normalizedMsg, "merci", "thanks", "thank you", "cool", "super", "genial", "génial")) {
            return Optional.of("Avec plaisir ! 😊 N'hésitez pas si vous avez d'autres questions.");
        }

        if (matches(normalizedMsg, "election", "élection", "scrutin", "en cours")) {
            Optional<Election> activeOpt = getActiveElection();
            if (activeOpt.isPresent()) {
                Election e = activeOpt.get();
                long candidateCount = candidateRepository.countByElectionIdAndStatus(e.getId(), CandidateStatus.VALIDATED);
                String msg = String.format("📋 L'élection en cours est : **%s**.\nLa période de vote se déroule du %s au %s.\nIl y a actuellement %d candidats validés. Voulez-vous voter ou voir les candidats ?",
                        e.getTitle(), formatDateFr(e.getVoteStart()), formatDateFr(e.getVoteEnd()), candidateCount);
                return Optional.of(msg);
            }
            return Optional.of("Aucune élection n'est actuellement active. Restez à l'écoute pour les prochains scrutins !");
        }

        if (matches(normalizedMsg, "comment voter", "comment vote", "voter", "comment je vote", "comment faire pour voter")) {
            return Optional.of("🗳️ **Comment voter sur EasyVote :**\n1. Connectez-vous à votre compte\n2. Vérifiez votre email (OTP)\n3. Allez dans 'Élections' → choisissez l'élection active\n4. Consultez les programmes des candidats\n5. Cliquez sur 'Voter maintenant' et choisissez votre candidat\n\n🔒 Votre vote est anonyme et définitif.");
        }

        if (matches(normalizedMsg, "anonyme", "anonymat", "securise", "sécurisé", "securite", "sécurité", "secret", "confidentiel", "prive", "privé")) {
            return Optional.of("🔐 **Anonymat garanti** : Votre vote est protégé par un système cryptographique. Lorsque vous votez, un jeton hashé (SHA-256) est utilisé à la place de votre identité. Personne, pas même les administrateurs, ne peut savoir pour qui vous avez voté.");
        }

        if (matches(normalizedMsg, "quand", "date", "debut", "début", "fin", "jusqu'a", "jusqu'à", "periode", "période")) {
            Optional<Election> activeOpt = getActiveElection();
            if (activeOpt.isPresent()) {
                Election e = activeOpt.get();
                return Optional.of(String.format("📅 La période de vote se déroule du %s au %s.\nLa campagne s'est tenue du %s au %s.",
                        formatDateFr(e.getVoteStart()), formatDateFr(e.getVoteEnd()), formatDateFr(e.getCampaignStart()), formatDateFr(e.getCampaignEnd())));
            }
            return Optional.of("Les dates seront communiquées dès qu'une nouvelle élection sera lancée.");
        }

        if (matches(normalizedMsg, "candidat", "programme", "qui", "liste", "tous")) {
            Optional<Election> activeOpt = getActiveElection();
            if (activeOpt.isPresent()) {
                List<Candidate> candidates = candidateRepository.findByElectionIdAndStatus(activeOpt.get().getId(), CandidateStatus.VALIDATED);
                if (candidates.isEmpty()) {
                    return Optional.of("Aucun candidat n'est encore validé.");
                }
                StringBuilder sb = new StringBuilder("👥 Il y a " + candidates.size() + " candidats validés pour l'élection en cours :\n");
                for (Candidate c : candidates) {
                    sb.append("- **").append(c.getUser().getFullName()).append("** : ").append(c.getSlogan() != null ? c.getSlogan() : "Pas de slogan").append("\n");
                }
                sb.append("\nConsultez leurs profils complets dans la section 'Élections'.");
                return Optional.of(sb.toString());
            }
            return Optional.of("Il n'y a pas d'élection en cours, donc pas de liste de candidats.");
        }

        if (matches(normalizedMsg, "resultat", "résultat", "gagnant", "qui gagne", "score", "stats", "statistique")) {
            Optional<Election> activeOpt = electionRepository.findFirstByStatusOrderByCreatedAtDesc(ElectionStatus.VOTE_ACTIVE);
            if (activeOpt.isEmpty()) {
                activeOpt = electionRepository.findFirstByStatusOrderByCreatedAtDesc(ElectionStatus.CLOSED);
            }
            
            if (activeOpt.isPresent()) {
                Election e = activeOpt.get();
                if (e.getStatus() == ElectionStatus.VOTE_ACTIVE || e.getStatus() == ElectionStatus.CLOSED) {
                    return Optional.of("📊 Les résultats sont consultables en temps réel dans la section 'Élections' → 'Résultats'.");
                }
            }
            return Optional.of("Les résultats seront publiés à la clôture du vote.");
        }

        if (matches(normalizedMsg, "j'ai vote", "j'ai voté", "deja vote", "déjà voté", "mon vote", "ma participation")) {
            return Optional.of("Pour vérifier si vous avez déjà voté, rendez-vous dans la page de l'élection. Si vous voyez 'Vous avez déjà voté', votre vote a été enregistré. Si vous voyez 'Voter maintenant', vous pouvez encore le faire.");
        }

        if (matches(normalizedMsg, "me presenter", "me présenter", "devenir candidat", "deposer", "déposer", "postuler")) {
            return Optional.of("📝 **Pour vous présenter :**\n1. Allez dans 'Élections' → choisissez l'élection en période de campagne\n2. Cliquez sur 'Déposer ma candidature'\n3. Remplissez votre slogan et programme\n4. L'administration validera votre candidature sous 24h");
        }

        if (matches(normalizedMsg, "aide", "help", "que peux-tu faire", "fonctionnalite", "fonctionnalité", "features")) {
            return Optional.of("🤖 **Je peux vous aider sur :**\n• Élections en cours et dates\n• Comment voter étape par étape\n• Candidats et leurs programmes\n• Résultats et statistiques\n• Anonymat et sécurité du vote\n• Comment vous présenter comme candidat\n\nPosez votre question librement !");
        }

        if (matches(normalizedMsg, "qui es-tu", "qui es tu", "c'est qui", "ton nom", "qui parle")) {
            return Optional.of("Je suis EasyBot 🤖, l'assistant virtuel d'EasyVote. Je suis là pour vous accompagner dans le processus électoral universitaire 24/7.");
        }

        if (matches(normalizedMsg, "au revoir", "bye", "a bientot", "à bientôt", "ciao")) {
            return Optional.of("À bientôt ! 👋 Bonne participation à la démocratie étudiante.");
        }

        return Optional.empty();
    }

    public List<String> getSuggestedQuestions(String lastMessage) {
        String norm = normalize(lastMessage);
        if (norm.contains("election") || norm.contains("élection")) {
            return Arrays.asList("Comment voter ?", "Qui sont les candidats ?", "Quand sont les résultats ?");
        }
        if (norm.contains("candidat")) {
            return Arrays.asList("Voir les programmes", "Comment voter ?", "Devenir candidat");
        }
        if (norm.contains("vote") || norm.contains("voter")) {
            return Arrays.asList("Mon vote est-il anonyme ?", "Voir les résultats", "J'ai déjà voté");
        }
        return Arrays.asList("Quelles élections sont en cours ?", "Comment voter ?", "Comment devenir candidat ?");
    }

    private Optional<Election> getActiveElection() {
        Optional<Election> active = electionRepository.findFirstByStatusOrderByCreatedAtDesc(ElectionStatus.VOTE_ACTIVE);
        if (active.isPresent()) return active;
        return electionRepository.findFirstByStatusOrderByCreatedAtDesc(ElectionStatus.CAMPAIGN_ACTIVE);
    }

    private String normalize(String input) {
        if (input == null) return "";
        return Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s]", " ")
                .trim();
    }

    private boolean matches(String normalizedMsg, String... keywords) {
        for (String k : keywords) {
            if (normalizedMsg.contains(k)) {
                return true;
            }
        }
        return false;
    }

    private String formatDateFr(LocalDateTime dt) {
        if (dt == null) return "Non défini";
        return dt.format(DateTimeFormatter.ofPattern("dd/MM/yyyy 'à' HH:mm"));
    }
}
