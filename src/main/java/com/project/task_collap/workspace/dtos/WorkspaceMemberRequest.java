package com.project.task_collap.workspace.dtos;

import com.project.task_collap.workspace.WorkspaceRole;

import jakarta.validation.constraints.NotNull;

public record WorkspaceMemberRequest(@NotNull Integer workspaceId, @NotNull Integer userId,
        @NotNull WorkspaceRole role) {

}
