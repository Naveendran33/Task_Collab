package com.project.task_collap.workspace;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.task_collap.user.User;

public interface WorkspaceRepository extends JpaRepository<Workspace, Integer> {
    List<Workspace> findByOwner(User owner);

}