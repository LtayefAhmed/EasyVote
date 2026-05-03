package com.easyvote.backend.repository;

import com.easyvote.backend.entity.User;
import com.easyvote.backend.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByStudentId(String studentId);

    List<User> findByRole(Role role);

    long countByIsVerifiedTrue();

    List<User> findByIsVerifiedTrue();
}
