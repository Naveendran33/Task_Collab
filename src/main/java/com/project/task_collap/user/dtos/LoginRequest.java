package com.project.task_collap.user.dtos;

import jakarta.validation.constraints.NotEmpty;

public record LoginRequest(
        @NotEmpty String username,
        @NotEmpty String password) {

}
