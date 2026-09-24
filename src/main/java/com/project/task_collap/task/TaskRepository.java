package com.project.task_collap.task;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.project.task_collap.workspace.Workspace;
import com.project.task_collap.workspace.WorkspaceMember;

public interface TaskRepository extends JpaRepository<Task, Integer> {
    List<Task> findAllTasksByWorkspace(Workspace workspace);

    Page<Task> findAllTasksByWorkspace(Workspace workspace, Pageable pageable);

    List<Task> findAllTasksByAssignee(WorkspaceMember assignee);
}
