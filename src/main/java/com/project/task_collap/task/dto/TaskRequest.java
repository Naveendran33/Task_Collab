package com.project.task_collap.task.dto;

import java.time.LocalDate;

import com.project.task_collap.task.TaskPriority;
import com.project.task_collap.task.TaskStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TaskRequest(
        @NotBlank String title,
        String description,
        @NotNull Integer workspaceId,
        Integer assigneeId,
        @NotNull TaskStatus status,
        @NotNull TaskPriority priority,
        LocalDate dueDate) {

}
