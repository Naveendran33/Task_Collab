package com.project.task_collap.workspace;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import com.project.task_collap.user.User;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, Integer> {
    @Modifying
    @Transactional
    Integer deleteAllByWorkspace(Workspace workspace);

    List<WorkspaceMember> findAllByWorkspace(Workspace workspace);

    Boolean existsByUserAndWorkspace(User user, Workspace workspace);

    List<WorkspaceMember> findAllWorkspaceMembersByUser(User user);
}
