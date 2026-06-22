package com.project.task_collap.task.dto;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import com.project.task_collap.task.TaskPriority;
import com.project.task_collap.task.TaskStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TaskRequest(
        @NotBlank String title,
        String description,
        @NotNull Integer workspaceId,
        Integer assigneeMemberId,
        @NotNull TaskStatus status,
        @NotNull TaskPriority priority,
        @JsonFormat(shape = Shape.STRING, pattern = ("dd-MM-yyyy")) LocalDate dueDate) {

}
