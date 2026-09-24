package com.project.task_collap.task;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.project.task_collap.task.dto.TaskRequest;
import com.project.task_collap.task.dto.TaskResponse;
import com.project.task_collap.user.User;
import com.project.task_collap.user.UserRepository;
import com.project.task_collap.workspace.Workspace;
import com.project.task_collap.workspace.WorkspaceMember;
import com.project.task_collap.workspace.WorkspaceMemberRepository;
import com.project.task_collap.workspace.WorkspaceRepository;
import com.project.task_collap.workspace.WorkspaceRole;

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

    private User owner;
    private User workerUser;
    private Workspace workspace;
    private WorkspaceMember workerMember;
    private WorkspaceMember viewerMember;
    private Task sampleTask;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1);
        owner.setUsername("naveen");
        owner.setEmail("naveen@gmail.com");
        owner.setPasswordHash("1234");
        owner.setCreatedAt(LocalDateTime.now());

        workerUser = new User();
        workerUser.setId(2);
        workerUser.setUsername("ram");
        workerUser.setEmail("ram@gmail.com");
        workerUser.setPasswordHash("4321");
        workerUser.setCreatedAt(LocalDateTime.now());

        workspace = new Workspace();
        workspace.setId(1);
        workspace.setName("Test Workspace");
        workspace.setDescription("Just Testing");
        workspace.setOwner(owner);
        workspace.setCreatedAt(LocalDateTime.now());

        workerMember = new WorkspaceMember();
        workerMember.setId(10);
        workerMember.setUser(workerUser);
        workerMember.setWorkspace(workspace);
        workerMember.setRole(WorkspaceRole.WORKER);

        viewerMember = new WorkspaceMember();
        viewerMember.setId(20);
        viewerMember.setUser(workerUser);
        viewerMember.setWorkspace(workspace);
        viewerMember.setRole(WorkspaceRole.VIEWER);

        sampleTask = new Task();
        sampleTask.setId(100);
        sampleTask.setTitle("Testing Task");
        sampleTask.setDescription("Test Description");
        sampleTask.setWorkspace(workspace);
        sampleTask.setAssignee(workerMember);
        sampleTask.setStatus(TaskStatus.TODO);
        sampleTask.setPriority(TaskPriority.LOW);
        sampleTask.setDueDate(LocalDate.now().plusDays(5));
        sampleTask.setCreatedAt(LocalDateTime.now());
        sampleTask.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void testCreateTask_Success() {
        TaskRequest request = new TaskRequest(
                sampleTask.getTitle(), sampleTask.getDescription(), workspace.getId(),
                workerMember.getId(), sampleTask.getStatus(), sampleTask.getPriority(), sampleTask.getDueDate());

        Mockito.when(workspaceRepository.findById(workspace.getId())).thenReturn(Optional.of(workspace));
        Mockito.when(workspaceMemberRepository.findById(workerMember.getId())).thenReturn(Optional.of(workerMember));
        Mockito.when(taskRepository.save(Mockito.any(Task.class))).thenReturn(sampleTask);

        TaskResponse response = taskService.createTask(request, owner.getId());

        Assertions.assertNotNull(response);
        Assertions.assertEquals(sampleTask.getId(), response.taskId());
        Assertions.assertEquals(sampleTask.getTitle(), response.title());
        Assertions.assertEquals(TaskStatus.TODO, response.status());
    }

    @Test
    void testCreateTask_Forbidden_WhenNotOwner() {
        TaskRequest request = new TaskRequest(
                sampleTask.getTitle(), sampleTask.getDescription(), workspace.getId(),
                workerMember.getId(), sampleTask.getStatus(), sampleTask.getPriority(), sampleTask.getDueDate());

        Mockito.when(workspaceRepository.findById(workspace.getId())).thenReturn(Optional.of(workspace));

        ResponseStatusException ex = Assertions.assertThrows(ResponseStatusException.class, () -> {
            taskService.createTask(request, 999); // 999 is not owner
        });

        Assertions.assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void testCreateTask_Forbidden_WhenAssigneeIsViewer() {
        TaskRequest request = new TaskRequest(
                sampleTask.getTitle(), sampleTask.getDescription(), workspace.getId(),
                viewerMember.getId(), sampleTask.getStatus(), sampleTask.getPriority(), sampleTask.getDueDate());

        Mockito.when(workspaceRepository.findById(workspace.getId())).thenReturn(Optional.of(workspace));
        Mockito.when(workspaceMemberRepository.findById(viewerMember.getId())).thenReturn(Optional.of(viewerMember));

        ResponseStatusException ex = Assertions.assertThrows(ResponseStatusException.class, () -> {
            taskService.createTask(request, owner.getId());
        });

        Assertions.assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        Assertions.assertTrue(ex.getReason().contains("VIEWER"));
    }

    @Test
    void testChangeStatus_Success() {
        Mockito.when(taskRepository.findById(sampleTask.getId())).thenReturn(Optional.of(sampleTask));
        Mockito.when(taskRepository.save(Mockito.any(Task.class))).thenReturn(sampleTask);

        TaskResponse response = taskService.changeStatus(workerUser.getId(), sampleTask.getId(), TaskStatus.IN_PROGRESS);

        Assertions.assertNotNull(response);
        Assertions.assertEquals(TaskStatus.IN_PROGRESS, sampleTask.getStatus());
    }

    @Test
    void testChangeStatus_Forbidden_WhenNotAssignee() {
        Mockito.when(taskRepository.findById(sampleTask.getId())).thenReturn(Optional.of(sampleTask));

        ResponseStatusException ex = Assertions.assertThrows(ResponseStatusException.class, () -> {
            taskService.changeStatus(999, sampleTask.getId(), TaskStatus.DONE);
        });

        Assertions.assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void testDeleteTask_Forbidden_WhenNotOwner() {
        Mockito.when(taskRepository.findById(sampleTask.getId())).thenReturn(Optional.of(sampleTask));

        ResponseStatusException ex = Assertions.assertThrows(ResponseStatusException.class, () -> {
            taskService.deleteTask(999, sampleTask.getId()); // Not owner
        });

        Assertions.assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void testGetTasksForWorkspacePaged_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Task> taskPage = new PageImpl<>(List.of(sampleTask), pageable, 1);

        Mockito.when(workspaceRepository.findById(workspace.getId())).thenReturn(Optional.of(workspace));
        Mockito.when(userRepository.findById(owner.getId())).thenReturn(Optional.of(owner));
        Mockito.when(workspaceMemberRepository.existsByUserAndWorkspace(owner, workspace)).thenReturn(true);
        Mockito.when(taskRepository.findAllTasksByWorkspace(workspace, pageable)).thenReturn(taskPage);

        Page<TaskResponse> response = taskService.getTasksForWorkspacePaged(workspace.getId(), owner.getId(), pageable);

        Assertions.assertNotNull(response);
        Assertions.assertEquals(1, response.getTotalElements());
        Assertions.assertEquals(sampleTask.getTitle(), response.getContent().get(0).title());
    }
}
