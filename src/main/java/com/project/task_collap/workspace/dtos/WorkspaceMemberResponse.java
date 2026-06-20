package com.project.task_collap.workspace.dtos;

import com.project.task_collap.workspace.WorkspaceRole;

public record WorkspaceMemberResponse(
                Integer WorkspaceMemberId,
                Integer UserId, Integer workspaceId, WorkspaceRole userRole) {
}
