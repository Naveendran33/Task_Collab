package com.project.task_collap.task;

import org.springframework.stereotype.Component;

import com.project.task_collap.task.dto.TaskResponse;
import com.project.task_collap.workspace.mapper.WorkspaceMapper;

@Component
public class TaskMapper {

    public static TaskResponse taskToTaskResponse(Task task) {
        return new TaskResponse(task.getId(), task.getTitle(), task.getDescription(),
                WorkspaceMapper.workspaceToResponse(task.getWorkspace()),
                WorkspaceMapper.workspaceMemberToResponse(task.getAssignee()), task.getStatus(), task.getPriority(),
                task.getDueDate(), task.getCreatedAt(), task.getUpdatedAt());
    }

    private TaskMapper() {
        /* This utility class should not be instantiated */
    }
}
