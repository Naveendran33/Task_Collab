package com.project.task_collap.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CommentRequest(@NotBlank String content, @NotNull Integer taskId) {

}
