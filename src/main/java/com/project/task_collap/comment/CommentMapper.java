package com.project.task_collap.comment;

import com.project.task_collap.comment.dto.CommentResponse;

public class CommentMapper {

    public static CommentResponse commentToCommentResponse(Comment comment) {
        return new CommentResponse(comment.getId(), comment.getContent(), comment.getTask().getId(),
                comment.getCommenter().getId(), comment.getCommenter().getUser().getUsername(), comment.getCreatedAt(),
                comment.getUpdatedAt());
    }
}
