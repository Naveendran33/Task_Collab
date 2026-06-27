package com.project.task_collap.comment;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.task_collap.comment.dto.CommentRequest;
import com.project.task_collap.comment.dto.CommentResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/comments")
public class CommentController {
    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<CommentResponse>> getAllCommentsForTask(@PathVariable Integer taskId,
            HttpServletRequest httpServlet) {
        Integer userId = commentService.getUserFromServlet(httpServlet);
        List<CommentResponse> responses = commentService.getCommentsForTask(userId, taskId);
        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    @PostMapping("/add")
    public ResponseEntity<CommentResponse> createComment(@Valid @RequestBody CommentRequest request,
            HttpServletRequest httpServlet) {
        Integer userId = commentService.getUserFromServlet(httpServlet);
        CommentResponse response = commentService.addComment(userId, request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PatchMapping("/edit/{commentId}")
    public ResponseEntity<CommentResponse> editComment(@PathVariable Integer commentId, @RequestParam String newContent,
            HttpServletRequest httpServlet) {
        Integer userId = commentService.getUserFromServlet(httpServlet);
        CommentResponse response = commentService.editComment(userId, commentId, newContent);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{commentId}")
    public ResponseEntity<String> deleteComment(@PathVariable Integer commentId, HttpServletRequest httpServlet) {
        Integer userId = commentService.getUserFromServlet(httpServlet);
        String response = commentService.deleteComment(userId, commentId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
