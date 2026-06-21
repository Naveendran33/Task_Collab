package com.project.task_collap.task;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.project.task_collap.workspace.Workspace;

public interface TaskRepository extends JpaRepository<Task, Integer> {
    List<Task> findAllTasksByWorkspace(Workspace workspace);
}
