package com.project.task_collap.workspace.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record WorkspaceRequestDto(
        @NotBlank @NotNull String name,
        String description) {

}
