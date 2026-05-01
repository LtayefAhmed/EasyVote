package com.easyvote.backend.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSummary {

    private Long id;
    private String email;
    private String fullName;
    private String role;
    private boolean isVerified;
    private String profilePicture;
}
