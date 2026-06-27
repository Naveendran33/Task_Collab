package com.project.task_collap.task.dto;

import java.util.Optional;

import com.project.task_collap.task.TaskPriority;

public record TaskUpdateRequest(Optional<String> name, Optional<String> description, Optional<TaskPriority> priority) {
}
