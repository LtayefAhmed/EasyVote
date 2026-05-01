package com.easyvote.backend.repository;

import com.easyvote.backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByCandidateIdOrderByCreatedAtDesc(Long candidateId);

    long countByCandidateId(Long candidateId);
}
