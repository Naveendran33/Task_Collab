package com.project.task_collap.workspace.mapper;

import com.project.task_collap.user.User;
import com.project.task_collap.workspace.Workspace;
import com.project.task_collap.workspace.WorkspaceMember;
import com.project.task_collap.workspace.dtos.MyWorkspacesResponse;
import com.project.task_collap.workspace.dtos.WorkspaceMemberResponse;
import com.project.task_collap.workspace.dtos.WorkspaceResponseDto;
import com.project.task_collap.workspace.dtos.WorkspaceUserResponse;

public class WorkspaceMapper {
    private WorkspaceMapper() {
        /* This utility class should not be instantiated */
    }

    public static WorkspaceUserResponse userToUserResponse(User user) {
        return new WorkspaceUserResponse(user.getUsername(), user.getEmail());
    }

    public static WorkspaceResponseDto workspaceToResponse(Workspace workspace) {
        return new WorkspaceResponseDto(workspace.getId(), workspace.getName(), workspace.getDescription(),
                workspace.getOwner().getId(), workspace.getOwner().getUsername(), workspace.getCreatedAt());
    }

    public static WorkspaceMemberResponse workspaceMemberToResponse(WorkspaceMember workspaceMember) {
        return new WorkspaceMemberResponse(workspaceMember.getId(), workspaceMember.getUser().getId(),
                workspaceMember.getWorkspace().getId(),
                workspaceMember.getRole(), workspaceMember.getUser().getUsername(),
                workspaceMember.getUser().getEmail());
    }

    public static MyWorkspacesResponse workspaceMemberToMyWorkspaceResponse(WorkspaceMember workspaceMember) {
        return new MyWorkspacesResponse(workspaceMember.getWorkspace().getId(),
                workspaceMember.getWorkspace().getName(), workspaceMember.getId(), workspaceMember.getRole());
    }
}
