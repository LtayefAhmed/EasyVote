package com.easyvote.backend.dto.engagement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LikeToggleResponse {

    private boolean liked;
    private long totalLikes;
}
