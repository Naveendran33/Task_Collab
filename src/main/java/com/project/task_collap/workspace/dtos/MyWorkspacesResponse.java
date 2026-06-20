package com.project.task_collap.workspace.dtos;

import com.project.task_collap.workspace.WorkspaceRole;

public record MyWorkspacesResponse(Integer workspaceId, String workspaceName, Integer memberId, WorkspaceRole role) {

}
