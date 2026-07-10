package com.project.task_collap.task;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import com.project.task_collap.task.dto.TaskRequest;
import com.project.task_collap.task.dto.TaskResponse;
import com.project.task_collap.user.User;
import com.project.task_collap.user.UserRepository;
import com.project.task_collap.workspace.Workspace;
import com.project.task_collap.workspace.WorkspaceMember;
import com.project.task_collap.workspace.WorkspaceMemberRepository;
import com.project.task_collap.workspace.WorkspaceRepository;
import com.project.task_collap.workspace.WorkspaceRole;
import com.project.task_collap.workspace.dtos.WorkspaceMemberResponse;
import com.project.task_collap.workspace.dtos.WorkspaceResponseDto;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    TaskRepository taskRepository;
    @Mock
    WorkspaceRepository workspaceRepository;
    @Mock
    WorkspaceMemberRepository workspaceMemberRepository;
    @Mock
    UserRepository userRepository;

    @InjectMocks
    TaskService taskService;

    @Test
    void testCreateTask() {
        User user = new User();
        user.setCreatedAt(LocalDateTime.MAX);
        user.setEmail("naveen@gmail.com");
        user.setId(1);
        user.setPasswordHash("1234");
        user.setUsername("naveen");

        User assignee = new User();
        assignee.setCreatedAt(LocalDateTime.MAX);
        assignee.setEmail("ram@gmail.com");
        assignee.setId(2);
        assignee.setPasswordHash("4321");
        assignee.setUsername("ram");

        Workspace workspace = new Workspace();
        workspace.setId(1);
        workspace.setCreatedAt(LocalDateTime.MAX);
        workspace.setOwner(user);
        workspace.setDescription("Just Testing");
        workspace.setName("Test");

        WorkspaceResponseDto workspaceResponseDto = new WorkspaceResponseDto(workspace.getId(), workspace.getName(),
                workspace.getDescription(), workspace.getOwner().getId(), workspace.getOwner().getUsername(), workspace.getCreatedAt());

        WorkspaceMember member = new WorkspaceMember();
        member.setId(1);
        member.setRole(WorkspaceRole.WORKER);
        member.setUser(assignee);
        member.setWorkspace(workspace);

        WorkspaceMemberResponse memberResponse = new WorkspaceMemberResponse(member.getId(), member.getUser().getId(),
                member.getWorkspace().getId(), member.getRole(), member.getUser().getUsername(), member.getUser().getEmail());

        Task task = new Task();
        task.setAssignee(member);
        task.setCreatedAt(LocalDateTime.MAX);
        task.setDescription("Test");
        task.setWorkspace(workspace);
        task.setDueDate(LocalDate.MAX);
        task.setId(1);
        task.setPriority(TaskPriority.LOW);
        task.setStatus(TaskStatus.TODO);
        task.setTitle("Testing");
        task.setUpdatedAt(LocalDateTime.MAX);

        TaskRequest request = new TaskRequest(task.getTitle(), task.getDescription(), 1, 1, TaskStatus.TODO,
                TaskPriority.LOW, task.getDueDate());

        TaskResponse expected = new TaskResponse(task.getId(), task.getTitle(), task.getDescription(),
                workspaceResponseDto, memberResponse, task.getStatus(), task.getPriority(), task.getDueDate(),
                task.getCreatedAt(), task.getUpdatedAt());

        Mockito.when(workspaceMemberRepository.findById(1)).thenReturn(Optional.of(member));
        Mockito.when(workspaceRepository.findById(1)).thenReturn(Optional.of(workspace));
        Mockito.when(taskRepository.save(Mockito.any(Task.class))).thenReturn(task);

        TaskResponse response = taskService.createTask(request, 1);

        Assertions.assertEquals(expected.taskId(), response.taskId());
        Assertions.assertEquals(expected.title(), response.title());
        Assertions.assertEquals(expected.description(), response.description());
        Assertions.assertEquals(expected.assignee(), response.assignee());
        Assertions.assertEquals(expected.createdAt(), response.createdAt());
        Assertions.assertEquals(expected.dueDate(), response.dueDate());

    }
}
