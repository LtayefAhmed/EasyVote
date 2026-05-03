package com.easyvote.backend.dto.engagement;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateAnnouncementRequest {

    @Size(max = 200, message = "Le titre ne doit pas dépasser 200 caractères")
    private String title;

    @Size(max = 2000, message = "Le contenu ne doit pas dépasser 2000 caractères")
    private String content;
}
