package com.project.task_collap.user.mapper;

import org.springframework.stereotype.Component;

import com.project.task_collap.user.User;
import com.project.task_collap.user.dtos.UserResponce;

@Component
public class UserMapper {

    public UserResponce userToUserResponce(User user) {
        return new UserResponce(user.getUsername(), user.getEmail(), user.getCreatedAt());
    }
}
