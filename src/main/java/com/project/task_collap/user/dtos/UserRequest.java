package com.project.task_collap.user.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserRequest(
        @NotBlank @NotNull String username,
        @Email @NotBlank String email,
        @NotBlank String password) {

}
