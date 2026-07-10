package com.project.task_collap.task.dto;

import com.project.task_collap.task.TaskPriority;

public record TaskUpdateRequest(String name, String description, TaskPriority priority) {
}
