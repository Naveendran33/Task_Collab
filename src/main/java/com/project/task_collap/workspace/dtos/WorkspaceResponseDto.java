package com.project.task_collap.workspace.dtos;

import java.time.LocalDateTime;

public record WorkspaceResponseDto(Integer workspaceId, String name, String description, Integer ownerId,
        String ownerName, LocalDateTime createdAt) {

}
