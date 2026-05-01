package com.easyvote.backend.repository;

import com.easyvote.backend.entity.VoteToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoteTokenRepository extends JpaRepository<VoteToken, Long> {

    Optional<VoteToken> findByUserIdAndElectionId(Long userId, Long electionId);

    Optional<VoteToken> findByTokenHash(String tokenHash);

    boolean existsByUserIdAndElectionIdAndUsedTrue(Long userId, Long electionId);
}
