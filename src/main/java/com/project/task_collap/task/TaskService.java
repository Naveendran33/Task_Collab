package com.project.task_collap.task;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.server.ResponseStatusException;

import com.project.task_collap.task.dto.TaskRequest;
import com.project.task_collap.task.dto.TaskResponse;
import com.project.task_collap.task.dto.TaskUpdateRequest;
import com.project.task_collap.user.User;
import com.project.task_collap.user.UserRepository;
import com.project.task_collap.workspace.Workspace;
import com.project.task_collap.workspace.WorkspaceMember;
import com.project.task_collap.workspace.WorkspaceMemberRepository;
import com.project.task_collap.workspace.WorkspaceRepository;
import com.project.task_collap.workspace.WorkspaceRole;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
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
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are not allowed to create task in this workspace");
        }
        WorkspaceMember assignee = request.assigneeMemberId() != null
                ? memberIdToWorkspaceMember(request.assigneeMemberId())
                : null;

        if (assignee != null && assignee.getRole() == WorkspaceRole.VIEWER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Assighnee was a VIEWER");
        }

        Task task = new Task();
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setWorkspace(workspace);
        task.setAssignee(assignee);
        task.setStatus(request.status());
        task.setPriority(request.priority());
        task.setDueDate(request.dueDate());
        task = taskRepository.save(task);

        return TaskMapper.taskToTaskResponse(task);

    }

    public List<TaskResponse> getAllTasksForWorkspace(Integer workspaceId, Integer userId) {
        Workspace workspace = workspaceIdToWorkspace(workspaceId);

        User user = userIdToUser(userId);
        if (Boolean.TRUE.equals(workspaceMemberRepository.existsByUserAndWorkspace(user, workspace))) {
            List<Task> responses = taskRepository.findAllTasksByWorkspace(workspace);
            return responses.stream().map(TaskMapper::taskToTaskResponse).toList();
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a Member of this Workspace");
        }

    }

    public List<TaskResponse> getMyTask(Integer userId, Integer memberId) {

        WorkspaceMember member = memberIdToWorkspaceMember(memberId);
        if (member.getUser().getId().equals(userId)) {
            List<Task> myTasks = taskRepository.findAllTasksByAssignee(member);
            return myTasks.stream().map(TaskMapper::taskToTaskResponse).toList();
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "The Member Id is not yours");
        }

    }

    public TaskResponse assignTask(Integer ownerId, Integer taskId, Integer assigneeId) {
        Task task = taskIdToTask(taskId);
        WorkspaceMember assignee = memberIdToWorkspaceMember(assigneeId);
        if (task.getWorkspace().getOwner().getId().equals(ownerId) && assignee.getRole() != WorkspaceRole.VIEWER) {
            task.setAssignee(assignee);
            task = taskRepository.save(task);
            return TaskMapper.taskToTaskResponse(task);
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Only Owner can assign \"Worker\" To Task ");
        }
    }

    public TaskResponse giveDueDate(Integer ownerId, Integer taskId, LocalDate dueDate) {
        Task task = taskIdToTask(taskId);
        if (task.getWorkspace().getOwner().getId().equals(ownerId)) {
            task.setDueDate(dueDate);
            task = taskRepository.save(task);
            return TaskMapper.taskToTaskResponse(task);
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are Not allowed to set the dueDate");
        }
    }

    public TaskResponse changeStatus(Integer userId, Integer taskId, TaskStatus status) {
        Task task = taskIdToTask(taskId);
        if (task.getAssignee() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Add a Assignee to the task");
        }
        if (task.getAssignee().getUser().getId().equals(userId)) {
            task.setStatus(status);
            task = taskRepository.save(task);
            return TaskMapper.taskToTaskResponse(task);
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are Not Allowed to Change the Status");
        }
    }

    @Transactional
    public String deleteTask(Integer userId, Integer taskId) {
        Task task = taskIdToTask(taskId);
        if (task.getWorkspace().getOwner().getId().equals(userId)) {
            taskRepository.delete(task);
            return "Task with Id :" + taskId + " deleted successfully";
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are Not Allowed to Delete the Task");
        }
    }

    public TaskResponse updateTask(TaskUpdateRequest updateRequest, Integer taskId, Integer userId) {
        Task task = taskIdToTask(taskId);

        if (task.getWorkspace().getOwner().getId().equals(userId)) {
            if (updateRequest.name() != null)
                task.setTitle(updateRequest.name());
            if (updateRequest.description() != null)
                task.setDescription(updateRequest.description());
            if (updateRequest.priority() != null)
                task.setPriority(updateRequest.priority());

            task = taskRepository.save(task);
            return TaskMapper.taskToTaskResponse(task);
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are Not Allowed to update the Task");
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

    public Task taskIdToTask(Integer taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No Task with Id : " + taskId));
    }

    public Integer getUserIdFromHeader(HttpServletRequest httpServletRequest) {
        return (Integer) httpServletRequest.getAttribute("userId");
    }

    public WorkspaceMember memberIdToWorkspaceMember(Integer memberId) {
        return workspaceMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "WorkspaceMember no found"));
    }

}
