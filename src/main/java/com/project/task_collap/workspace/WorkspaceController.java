package com.project.task_collap.workspace;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.task_collap.workspace.dtos.MyWorkspacesResponse;
import com.project.task_collap.workspace.dtos.WorkspaceMemberRequest;
import com.project.task_collap.workspace.dtos.WorkspaceMemberResponse;
import com.project.task_collap.workspace.dtos.WorkspaceRequestDto;
import com.project.task_collap.workspace.dtos.WorkspaceResponseDto;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/workspace")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @PostMapping("/create")
    public ResponseEntity<WorkspaceResponseDto> createWorkspace(@Valid @RequestBody WorkspaceRequestDto request,
            HttpServletRequest httpServlet) {
        Integer ownerId = workspaceService.currentUserId(httpServlet);
        WorkspaceResponseDto response = workspaceService.createWorkspace(request, ownerId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my-workspaces")
    public ResponseEntity<List<WorkspaceResponseDto>> getMyWorkspace(HttpServletRequest httpServlet) {
        Integer ownerId = workspaceService.currentUserId(httpServlet);
        List<WorkspaceResponseDto> responce = workspaceService.getMyWorkspaces(ownerId);
        return new ResponseEntity<>(responce, HttpStatus.OK);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteMyWorkspace(HttpServletRequest httpServlet, @RequestParam Integer workspaceId) {
        Integer ownerId = workspaceService.currentUserId(httpServlet);
        String responce = workspaceService.deleteMyWorkspace(ownerId, workspaceId);
        return new ResponseEntity<>(responce, HttpStatus.OK);
    }

    @PostMapping("member/add")
    public ResponseEntity<WorkspaceMemberResponse> addMember(HttpServletRequest httpServlet,
            @Valid @RequestBody WorkspaceMemberRequest request) {
        Integer ownerId = workspaceService.currentUserId(httpServlet);
        WorkspaceMemberResponse response = workspaceService.addMember(ownerId, request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("member/all")
    public ResponseEntity<List<WorkspaceMemberResponse>> getAllMembers(@RequestParam Integer workspaceId) {
        List<WorkspaceMemberResponse> responses = workspaceService.getAllMembers(workspaceId);
        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    @DeleteMapping("member/delete")
    public ResponseEntity<String> deleteMember(@RequestParam Integer memberId,
            HttpServletRequest httpServlet) {
        Integer ownerId = workspaceService.currentUserId(httpServlet);
        String response = workspaceService.deleteMemberInWorkspace(memberId, ownerId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/member/update-role")
    public ResponseEntity<WorkspaceMemberResponse> updateRole(HttpServletRequest httpSelvlet, Integer memberId,
            WorkspaceRole role) {
        Integer ownerId = workspaceService.currentUserId(httpSelvlet);
        WorkspaceMemberResponse response = workspaceService.updateMemberRole(ownerId, memberId, role);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("member/myWorkspaces")
    public ResponseEntity<List<MyWorkspacesResponse>> allMyWorkspaces(HttpServletRequest httpServlet) {
        Integer userId = workspaceService.currentUserId(httpServlet);
        List<MyWorkspacesResponse> responses = workspaceService.getAllMyWorspaces(userId);
        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

}
