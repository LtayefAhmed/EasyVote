package com.easyvote.backend.repository;

import com.easyvote.backend.entity.Candidate;
import com.easyvote.backend.entity.enums.CandidateStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {

    List<Candidate> findByElectionId(Long electionId);

    List<Candidate> findByElectionIdAndStatus(Long electionId, CandidateStatus status);

    Optional<Candidate> findByUserIdAndElectionId(Long userId, Long electionId);

    List<Candidate> findByStatus(CandidateStatus status);

    long countByElectionIdAndStatus(Long electionId, CandidateStatus status);

    long countByElectionId(Long electionId);

    boolean existsByUserIdAndElectionId(Long userId, Long electionId);

    List<Candidate> findByUserId(Long userId);
}
