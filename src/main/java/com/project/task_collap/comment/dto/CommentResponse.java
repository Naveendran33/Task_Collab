package com.project.task_collap.comment.dto;

import java.time.LocalDateTime;

public record CommentResponse(Integer commentId, String content, Integer taskId, Integer commenterMemberId,
        String commenterName, LocalDateTime createdAt, LocalDateTime updatedAt) {

}
