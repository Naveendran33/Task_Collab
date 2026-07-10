package com.project.task_collap.workspace.dtos;

import com.project.task_collap.workspace.WorkspaceRole;

public record WorkspaceMemberResponse(
        Integer workspaceMemberId,
        Integer userId, Integer workspaceId, WorkspaceRole userRole, String username, String email) {
}
