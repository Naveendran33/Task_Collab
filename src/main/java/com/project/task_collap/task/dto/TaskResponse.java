package com.project.task_collap.task.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.project.task_collap.task.TaskPriority;
import com.project.task_collap.task.TaskStatus;
import com.project.task_collap.workspace.dtos.WorkspaceMemberResponse;
import com.project.task_collap.workspace.dtos.WorkspaceResponseDto;

public record TaskResponse(
                Integer taskId,
                String title,
                String description,
                WorkspaceResponseDto workspace,
                WorkspaceMemberResponse assignee,
                TaskStatus status,
                TaskPriority priority,
                LocalDate dueDate,
                LocalDateTime createdAt,
                LocalDateTime lastUpdate) {

}
