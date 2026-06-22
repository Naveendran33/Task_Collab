package com.project.task_collap.task;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.task_collap.user.User;
import com.project.task_collap.workspace.Workspace;

public interface TaskRepository extends JpaRepository<Task, Integer> {
    List<Task> findAllTasksByWorkspace(Workspace workspace);

    List<Task> findAllTasksByAssignee(User assignee);
}
