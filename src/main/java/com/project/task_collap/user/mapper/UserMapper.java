package com.project.task_collap.user.mapper;

import com.project.task_collap.user.User;
import com.project.task_collap.user.dtos.UserResponse;

public class UserMapper {
    private UserMapper() {
        /* This utility class should not be instantiated */
    }

    public static UserResponse userToUserResponse(User user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail());
    }
}
