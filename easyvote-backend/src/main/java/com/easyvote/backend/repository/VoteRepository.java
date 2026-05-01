package com.easyvote.backend.repository;

import com.easyvote.backend.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {

    List<Vote> findByElectionId(Long electionId);

    long countByElectionId(Long electionId);

    long countByElectionIdAndCandidateId(Long electionId, Long candidateId);

    boolean existsByTokenHash(String tokenHash);

    @Query("SELECT v.candidate.id, COUNT(v) FROM Vote v WHERE v.election.id = :electionId GROUP BY v.candidate.id")
    List<Object[]> countVotesByCandidate(@Param("electionId") Long electionId);
}
