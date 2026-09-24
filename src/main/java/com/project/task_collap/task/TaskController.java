package com.project.task_collap.task;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.task_collap.config.jwt.UserPrincipal;
import com.project.task_collap.task.dto.TaskRequest;
import com.project.task_collap.task.dto.TaskResponse;
import com.project.task_collap.task.dto.TaskUpdateRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/task")
public class TaskController {
    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/all/{workspaceId}")
    public ResponseEntity<List<TaskResponse>> getAllTasksInWorkspace(@PathVariable Integer workspaceId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Integer userId = currentUser.getId();
        List<TaskResponse> responses = taskService.getAllTasksForWorkspace(workspaceId, userId);
        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    @GetMapping("/page/{workspaceId}")
    public ResponseEntity<Page<TaskResponse>> getTasksForWorkspacePaged(
            @PathVariable Integer workspaceId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Sort sort = direction.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<TaskResponse> responses = taskService.getTasksForWorkspacePaged(workspaceId, currentUser.getId(), pageable);
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/create")
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Integer userId = currentUser.getId();
        TaskResponse response = taskService.createTask(request, userId);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<List<TaskResponse>> getAllMyTasks(@AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam Integer memberId) {
        Integer userId = currentUser.getId();
        List<TaskResponse> responses = taskService.getMyTask(userId, memberId);
        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    @PutMapping("/assign")
    public ResponseEntity<TaskResponse> assignTask(@RequestParam Integer taskId, @RequestParam Integer assigneeId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Integer userId = currentUser.getId();
        TaskResponse response = taskService.assignTask(userId, taskId, assigneeId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/set-due-date")
    public ResponseEntity<TaskResponse> setDueDate(@RequestParam Integer taskId,
            @RequestParam("date") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate dueDate,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Integer userId = currentUser.getId();
        TaskResponse response = taskService.giveDueDate(userId, taskId, dueDate);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/status")
    public ResponseEntity<TaskResponse> changeStatus(@RequestParam Integer taskId, @RequestParam TaskStatus status,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Integer userId = currentUser.getId();
        TaskResponse response = taskService.changeStatus(userId, taskId, status);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PatchMapping("/update")
    public ResponseEntity<TaskResponse> updateTask(@RequestParam Integer taskId, @RequestBody TaskUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Integer userId = currentUser.getId();
        TaskResponse response = taskService.updateTask(request, taskId, userId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteTask(@RequestParam Integer taskId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Integer userId = currentUser.getId();
        String response = taskService.deleteTask(userId, taskId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
