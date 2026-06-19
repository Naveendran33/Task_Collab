package com.project.task_collap.user.dtos;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserResponce(
        @NotBlank String username,
        @NotBlank String email,
        @NotNull LocalDateTime createdAt) {

}
