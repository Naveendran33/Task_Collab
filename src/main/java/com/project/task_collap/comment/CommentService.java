package com.project.task_collap.comment;

import com.project.task_collap.workspace.WorkspaceRepository;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.project.task_collap.comment.dto.CommentRequest;
import com.project.task_collap.comment.dto.CommentResponse;
import com.project.task_collap.task.Task;
import com.project.task_collap.task.TaskRepository;
import com.project.task_collap.user.User;
import com.project.task_collap.user.UserRepository;
import com.project.task_collap.workspace.WorkspaceMember;
import com.project.task_collap.workspace.WorkspaceMemberRepository;
import com.project.task_collap.workspace.WorkspaceRole;

@Service
public class CommentService {

    private final TaskRepository taskRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public CommentService(TaskRepository taskRepository, CommentRepository commentRepository,
            UserRepository userRepository, WorkspaceMemberRepository workspaceMemberRepository) {
        this.taskRepository = taskRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
    }

    public CommentResponse addComment(Integer userId, CommentRequest request) {
        User user = getUserFromUserId(userId);
        Task task = getTaskFromTaskId(request.taskId());
        WorkspaceMember commenter = workspaceMemberRepository.findByUserAndWorkspace(user, task.getWorkspace())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "You are Not a Member of the Workspace"));

        if (task.getAssignee().equals(commenter) || commenter.getRole().equals(WorkspaceRole.OWNER)) {
            Comment comment = new Comment();
            comment.setCommenter(commenter);
            comment.setContent(request.content());
            comment.setTask(task);
            comment = commentRepository.save(comment);
            return CommentMapper.commentToCommentResponse(comment);
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are Not allowed to Comment on this task");
        }

    }

    public List<CommentResponse> getCommentsForTask(Integer userId, Integer taskId) {
        User user = getUserFromUserId(userId);
        Task task = getTaskFromTaskId(taskId);

        if (Boolean.TRUE.equals(workspaceMemberRepository.existsByUserAndWorkspace(user, task.getWorkspace()))) {
            List<Comment> allComments = commentRepository.findAllByTaskOrderByCreatedAtAsc(task);
            return allComments.stream().map(CommentMapper::commentToCommentResponse).toList();
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are Not a Member of this Workspace");
        }
    }

    public CommentResponse editComment(Integer userId, Integer commentId, String newContent) {
        Comment comment = getCommentFromCommentId(commentId);
        if (comment.getCommenter().getUser().getId().equals(userId)) {
            comment.setContent(newContent);
            commentRepository.save(comment);
            return CommentMapper.commentToCommentResponse(comment);
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are Not a Commenter");
        }
    }

    public String deleteComment(Integer userId, Integer commentId) {
        Comment comment = getCommentFromCommentId(commentId);
        if (comment.getCommenter().getUser().getId().equals(userId)
                || comment.getTask().getWorkspace().getOwner().getId().equals(userId)) {
            commentRepository.delete(comment);
            return "Comment with Id : " + commentId + " deleted Successfully";
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are Not Allowed to Delete this Comment");
        }
    }

    private User getUserFromUserId(Integer userId) {
        return userRepository.findById(userId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User Not found with Id : " + userId));
    }

    private Task getTaskFromTaskId(Integer taskId) {
        return taskRepository.findById(taskId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task Not found with Id : " + taskId));
    }

    private Comment getCommentFromCommentId(Integer commentId) {
        return commentRepository.findById(commentId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment Not found with Id : " + commentId));
    }
}
