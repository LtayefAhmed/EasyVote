package com.easyvote.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpVerifyRequest {

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format email invalide")
    private String email;

    @NotBlank(message = "Le code OTP est obligatoire")
    @Size(min = 6, max = 6, message = "Le code OTP doit contenir exactement 6 chiffres")
    @Pattern(regexp = "\\d{6}", message = "Le code OTP doit contenir uniquement des chiffres")
    private String code;
}
