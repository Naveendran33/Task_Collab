package com.project.task_collap.task;

import java.util.List;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.server.ResponseStatusException;

import com.project.task_collap.task.dto.TaskRequest;
import com.project.task_collap.task.dto.TaskResponse;
import com.project.task_collap.user.User;
import com.project.task_collap.user.UserRepository;
import com.project.task_collap.workspace.Workspace;
import com.project.task_collap.workspace.WorkspaceMemberRepository;
import com.project.task_collap.workspace.WorkspaceRepository;

import jakarta.validation.Valid;

@Service
@Validated
public class TaskService {
    private final TaskRepository taskRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.userRepository = userRepository;
    }

    public TaskResponse createTask(@Valid TaskRequest request, Integer ownerId) {
        Workspace workspace = workspaceIdToWorkspace(request.workspaceId());

        if (!Objects.equals(workspace.getOwner().getId(), ownerId)) {
            throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED,
                    "You are not allowed to create task in this workspace");
        }

        User assignee = userIdToUser(request.assigneeId());
        if (Boolean.FALSE.equals(workspaceMemberRepository.existsByUserAndWorkspace(assignee, workspace))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Assignee not a Member of the workspace Please add him to assign a task");
        }

        Task task = new Task();
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setWorkspace(workspace);
        task.setAssignee(assignee);
        task.setStatus(request.status());
        task.setPriority(request.priority());
        task.setDueDate(request.dueDate());

        taskRepository.save(task);

        return TaskMapper.taskToTaskResponse(task);

    }

    public List<TaskResponse> getAllTasksForWorkspace(Integer workspaceId, Integer userId) {
        Workspace workspace = workspaceRepository.findById(workspaceId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workspace Not Found at Id : " + workspaceId));

        User user = userRepository.findById(userId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User Not Found at Id : " + userId));

        if (Boolean.TRUE.equals(workspaceMemberRepository.existsByUserAndWorkspace(user, workspace))) {
            List<Task> tasks = taskRepository.findAllTasksByWorkspace(workspace);
            return tasks.stream().map(TaskMapper::taskToTaskResponse).toList();
        } else {
            throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED,
                    "Access denied : You are not a Member of this workspace");
        }
    }

    public User userIdToUser(Integer userId) {
        return userRepository.findById(userId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User Not Found at Id : " + userId));
    }

    public Workspace workspaceIdToWorkspace(Integer workspaceId) {
        return workspaceRepository.findById(workspaceId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workspace Not Found at Id : " + workspaceId));
    }
}
