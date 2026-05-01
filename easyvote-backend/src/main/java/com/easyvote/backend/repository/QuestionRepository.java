package com.easyvote.backend.repository;

import com.easyvote.backend.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByCandidateIdOrderByCreatedAtDesc(Long candidateId);

    List<Question> findByCandidateIdAndAnswerIsNotNullOrderByAnsweredAtDesc(Long candidateId);

    long countByCandidateIdAndAnswerIsNull(Long candidateId);
}
