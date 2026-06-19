package com.project.task_collap.user.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserResponce(
                @NotNull Integer userId,
                @NotBlank String username,
                @NotBlank String email) {

}
