package com.project.task_collap.task.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.project.task_collap.task.TaskPriority;
import com.project.task_collap.task.TaskStatus;
import com.project.task_collap.user.dtos.UserResponce;
import com.project.task_collap.workspace.dtos.WorkspaceResponseDto;

public record TaskResponse(
        String title,
        String description,
        WorkspaceResponseDto workspace,
        UserResponce assignee,
        TaskStatus status,
        TaskPriority priority,
        LocalDate dueDate,
        LocalDateTime createdAt,
        LocalDateTime lastUpdate) {

}
