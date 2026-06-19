package com.project.task_collap.user;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.task_collap.user.dtos.LoginRequest;
import com.project.task_collap.user.dtos.UserRequest;
import com.project.task_collap.user.dtos.UserResponce;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserResponce>> getAllUsers() {
        List<UserResponce> list = userService.allUsers();

        return ResponseEntity.ok(list);

    }

    @PostMapping("/create")
    public ResponseEntity<UserResponce> createUser(@Valid @RequestBody UserRequest request) {
        UserResponce responce = userService.createUser(request);
        return new ResponseEntity<>(responce, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@Valid @RequestBody LoginRequest request) {
        String token = userService.loginUser(request);
        return new ResponseEntity<>(token, HttpStatus.ACCEPTED);
    }

}
