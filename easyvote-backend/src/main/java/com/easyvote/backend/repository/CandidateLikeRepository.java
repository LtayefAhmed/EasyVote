package com.easyvote.backend.repository;

import com.easyvote.backend.entity.CandidateLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface CandidateLikeRepository extends JpaRepository<CandidateLike, Long> {

    boolean existsByCandidateIdAndUserId(Long candidateId, Long userId);

    Optional<CandidateLike> findByCandidateIdAndUserId(Long candidateId, Long userId);

    long countByCandidateId(Long candidateId);

    @Modifying
    @Transactional
    void deleteByCandidateIdAndUserId(Long candidateId, Long userId);
}
