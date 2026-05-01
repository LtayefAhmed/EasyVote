package com.easyvote.backend.security;

import com.easyvote.backend.entity.User;
import com.easyvote.backend.entity.enums.Role;
import lombok.Getter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

@Getter
public class UserPrincipal extends org.springframework.security.core.userdetails.User {

    private final Long userId;
    private final Role role;

    public UserPrincipal(User user) {
        super(
                user.getEmail(),
                user.getPassword(),
                user.isVerified(),       // enabled — blocks unverified OTP accounts
                true,                    // accountNonExpired
                true,                    // credentialsNonExpired
                true,                    // accountNonLocked
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
        this.userId = user.getId();
        this.role = user.getRole();
    }
}
