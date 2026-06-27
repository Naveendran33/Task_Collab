package com.project.task_collap.comment;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.task_collap.task.Task;

public interface CommentRepository extends JpaRepository<Comment, Integer> {
    List<Comment> findAllByTaskOrderByCreatedAtAsc(Task task);
}
