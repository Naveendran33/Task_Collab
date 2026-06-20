package com.project.task_collap.workspace.mapper;

import org.springframework.stereotype.Component;

import com.project.task_collap.user.User;
import com.project.task_collap.workspace.Workspace;
import com.project.task_collap.workspace.WorkspaceMember;
import com.project.task_collap.workspace.dtos.MyWorkspacesResponse;
import com.project.task_collap.workspace.dtos.WorkspaceMemberResponse;
import com.project.task_collap.workspace.dtos.WorkspaceResponseDto;
import com.project.task_collap.workspace.dtos.WorkspaceUserResponse;

@Component
public class WorkspaceMapper {

    public WorkspaceUserResponse userToUserResponse(User user) {
        return new WorkspaceUserResponse(user.getUsername(), user.getEmail());
    }

    public WorkspaceResponseDto workspaceToResponse(Workspace workspace) {
        return new WorkspaceResponseDto(workspace.getId(), workspace.getName(), workspace.getDescription(),
                workspace.getOwner().getId());
    }

    public WorkspaceMemberResponse workspaceMemberToResponse(WorkspaceMember workspaceMember) {
        return new WorkspaceMemberResponse(workspaceMember.getId(), workspaceMember.getUser().getId(),
                workspaceMember.getWorkspace().getId(),
                workspaceMember.getRole());
    }

    public MyWorkspacesResponse workspaceMemberToMyWorkspaceResponse(WorkspaceMember workspaceMember) {
        return new MyWorkspacesResponse(workspaceMember.getWorkspace().getId(),
                workspaceMember.getWorkspace().getName(), workspaceMember.getId(), workspaceMember.getRole());
    }
}
