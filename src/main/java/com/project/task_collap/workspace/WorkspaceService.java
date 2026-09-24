package com.project.task_collap.workspace;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.project.task_collap.user.User;
import com.project.task_collap.user.UserRepository;
import com.project.task_collap.workspace.dtos.MyWorkspacesResponse;
import com.project.task_collap.workspace.dtos.WorkspaceMemberRequest;
import com.project.task_collap.workspace.dtos.WorkspaceMemberResponse;
import com.project.task_collap.workspace.dtos.WorkspaceRequestDto;
import com.project.task_collap.workspace.dtos.WorkspaceResponseDto;
import com.project.task_collap.workspace.mapper.WorkspaceMapper;

@Service
public class WorkspaceService {

    private final WorkspaceMemberRepository workspaceMemberRepository;

    private final WorkspaceRepository workspaceRepository;

    private final UserRepository userRepository;

    public WorkspaceService(WorkspaceRepository workspaceRepository,
            UserRepository userRepository, WorkspaceMemberRepository workspaceMemberRepository) {
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
    }

    public WorkspaceResponseDto createWorkspace(WorkspaceRequestDto workspaceRequest, Integer ownerId) {
        User owner = userRepository.findById(ownerId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.CONFLICT, "There is no user with this Id : " + ownerId));
        Workspace workspace = new Workspace();
        workspace.setName(workspaceRequest.name());
        workspace.setDescription(workspaceRequest.description());
        workspace.setOwner(owner);
        workspace = workspaceRepository.save(workspace);

        WorkspaceMember member = new WorkspaceMember();
        member.setRole(WorkspaceRole.OWNER);
        member.setUser(owner);
        member.setWorkspace(workspace);
        workspaceMemberRepository.save(member);
        return WorkspaceMapper.workspaceToResponse(workspace);
    }

    public List<WorkspaceResponseDto> getMyWorkspaces(Integer ownerId) {
        User owner = getUserById(ownerId);
        List<Workspace> workspaces = workspaceRepository.findByOwner(owner);
        return workspaces.stream().map(WorkspaceMapper::workspaceToResponse).toList();
    }

    @Transactional
    public String deleteMyWorkspace(Integer ownerId, Integer workspaceId) {
        Workspace workspace = getWorkspaceById(workspaceId);
        if (workspace.getOwner().getId().equals(ownerId)) {
            workspaceMemberRepository.deleteAllByWorkspace(workspace);
            workspaceRepository.deleteById(workspaceId);
            return "Workspace with Id : " + workspaceId + " deleted successfully";
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are not the owner of this workspace to delete it");
        }
    }

    public WorkspaceMemberResponse addMember(Integer ownerId, WorkspaceMemberRequest request) {
        Workspace workspace = getWorkspaceById(request.workspaceId());
        User owner = workspace.getOwner();
        if (owner.getId().equals(ownerId)) {
            WorkspaceMember workspaceMember = new WorkspaceMember();
            User user = getUserById(request.userId());
            if (Boolean.TRUE.equals(workspaceMemberRepository.existsByUserAndWorkspace(user, workspace))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User already added to this workspace");
            }
            workspaceMember.setUser(user);
            if (request.role().equals(WorkspaceRole.OWNER)) {
                throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED, "Cannot change the owner");
            }
            workspaceMember.setRole(request.role());
            workspaceMember.setWorkspace(workspace);

            workspaceMember = workspaceMemberRepository.save(workspaceMember);
            workspaceRepository.save(workspace);

            return WorkspaceMapper.workspaceMemberToResponse(workspaceMember);
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are not the owner of this workspace to add members");
        }
    }

    public List<WorkspaceMemberResponse> getAllMembers(Integer workspaceId) {
        Workspace workspace = getWorkspaceById(workspaceId);
        List<WorkspaceMember> workspaceMembers = workspaceMemberRepository.findAllByWorkspace(workspace);
        return workspaceMembers.stream().map(WorkspaceMapper::workspaceMemberToResponse).toList();
    }

    @Transactional
    public String deleteMemberInWorkspace(Integer memberId, Integer ownerId) {
        WorkspaceMember member = workspaceMemberRepository.findById(memberId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No WorkspaceMember found with Id " + memberId));
        if (!member.getWorkspace().getOwner().getId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are not allowed to delete any workspace member");
        }

        if (member.getRole() == WorkspaceRole.OWNER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot delete the owner from the workspace");
        }
        workspaceMemberRepository.deleteById(memberId);
        return "Successfully deleted WorkspaceMember with Id : " + memberId;
    }

    public WorkspaceMemberResponse updateMemberRole(Integer ownerId, Integer memberId, WorkspaceRole role) {
        if (role == WorkspaceRole.OWNER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot set the role to OWNER");
        }
        WorkspaceMember member = getWorkspaceMemberById(memberId);
        if (member.getWorkspace().getOwner().getId().equals(ownerId)) {
            if (ownerId.equals(member.getUser().getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot change the role of an Owner");
            }
            member.setRole(role);
            workspaceMemberRepository.save(member);
            return WorkspaceMapper.workspaceMemberToResponse(member);
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the owner can change roles");
        }
    }

    public List<MyWorkspacesResponse> getAllMyWorkspaces(Integer userId) {
        User user = getUserById(userId);
        List<WorkspaceMember> myMemberDetails = workspaceMemberRepository.findAllWorkspaceMembersByUser(user);

        return myMemberDetails.stream().map(WorkspaceMapper::workspaceMemberToMyWorkspaceResponse).toList();

    }

    public User getUserById(Integer userId) {
        return userRepository.findById(userId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User Not found in Id : " + userId));
    }

    public Workspace getWorkspaceById(Integer workspaceId) {
        return workspaceRepository.findById(workspaceId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workspace Not found in Id : " + workspaceId));
    }

    public WorkspaceMember getWorkspaceMemberById(Integer memberId) {
        return workspaceMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Workspace Member not Found at Id : " + memberId));
    }
}
