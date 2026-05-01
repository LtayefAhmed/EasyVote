package com.easyvote.backend.repository;

import com.easyvote.backend.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    List<Announcement> findByCandidateIdOrderByCreatedAtDesc(Long candidateId);
}
