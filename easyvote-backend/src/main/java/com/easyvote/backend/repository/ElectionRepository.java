package com.easyvote.backend.repository;

import com.easyvote.backend.entity.Election;
import com.easyvote.backend.entity.enums.ElectionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ElectionRepository extends JpaRepository<Election, Long> {

    List<Election> findByStatus(ElectionStatus status);

    List<Election> findByStatusOrderByCreatedAtDesc(ElectionStatus status);

    Optional<Election> findFirstByStatusOrderByCreatedAtDesc(ElectionStatus status);

    @Query("SELECT e FROM Election e WHERE :now BETWEEN e.voteStart AND e.voteEnd")
    List<Election> findActiveVotingElections(@Param("now") LocalDateTime now);
}
