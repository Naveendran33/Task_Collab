package com.project.task_collap.task;

import com.project.task_collap.task.dto.TaskResponse;
import com.project.task_collap.workspace.mapper.WorkspaceMapper;

public class TaskMapper {

    public static TaskResponse taskToTaskResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                WorkspaceMapper.workspaceToResponse(task.getWorkspace()),
                task.getAssignee() != null
                        ? WorkspaceMapper.workspaceMemberToResponse(task.getAssignee())
                        : null,
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getUpdatedAt());
    }

    private TaskMapper() {
        /* This utility class should not be instantiated */
    }
}
