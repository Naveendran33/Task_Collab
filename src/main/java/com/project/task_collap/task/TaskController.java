package com.project.task_collap.task;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.task_collap.task.dto.TaskRequest;
import com.project.task_collap.task.dto.TaskResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/task")
public class TaskController {
    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<TaskResponse>> getAllTasksInWorkspace(@RequestParam Integer workspaceId,
            HttpServletRequest httpServlet) {
        Integer userId = (Integer) httpServlet.getAttribute("userId");
        List<TaskResponse> responses = taskService.getAllTasksForWorkspace(workspaceId, userId);
        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    @PostMapping("/create")
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request,
            HttpServletRequest httpServlet) {
        Integer userId = (Integer) httpServlet.getAttribute("userId");
        TaskResponse response = taskService.createTask(request, userId);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
