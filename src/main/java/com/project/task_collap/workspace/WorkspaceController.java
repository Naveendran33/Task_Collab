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

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.project.task_collap.config.jwt.UserPrincipal;
import com.project.task_collap.workspace.dtos.MyWorkspacesResponse;
import com.project.task_collap.workspace.dtos.WorkspaceMemberRequest;
import com.project.task_collap.workspace.dtos.WorkspaceMemberResponse;
import com.project.task_collap.workspace.dtos.WorkspaceRequestDto;
import com.project.task_collap.workspace.dtos.WorkspaceResponseDto;

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
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Integer ownerId = currentUser.getId();
        WorkspaceResponseDto response = workspaceService.createWorkspace(request, ownerId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/owned")
    public ResponseEntity<List<WorkspaceResponseDto>> getMyWorkspace(@AuthenticationPrincipal UserPrincipal currentUser) {
        Integer ownerId = currentUser.getId();
        List<WorkspaceResponseDto> response = workspaceService.getMyWorkspaces(ownerId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteMyWorkspace(@AuthenticationPrincipal UserPrincipal currentUser, @RequestParam Integer workspaceId) {
        Integer ownerId = currentUser.getId();
        String response = workspaceService.deleteMyWorkspace(ownerId, workspaceId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("member/add")
    public ResponseEntity<WorkspaceMemberResponse> addMember(@AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody WorkspaceMemberRequest request) {
        Integer ownerId = currentUser.getId();
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
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Integer ownerId = currentUser.getId();
        String response = workspaceService.deleteMemberInWorkspace(memberId, ownerId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/member/update-role")
    public ResponseEntity<WorkspaceMemberResponse> updateRole(@AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam Integer memberId,
            @RequestParam WorkspaceRole role) {
        Integer ownerId = currentUser.getId();
        WorkspaceMemberResponse response = workspaceService.updateMemberRole(ownerId, memberId, role);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("member/myWorkspaces")
    public ResponseEntity<List<MyWorkspacesResponse>> allMyWorkspaces(@AuthenticationPrincipal UserPrincipal currentUser) {
        Integer userId = currentUser.getId();
        List<MyWorkspacesResponse> responses = workspaceService.getAllMyWorkspaces(userId);
        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

}
