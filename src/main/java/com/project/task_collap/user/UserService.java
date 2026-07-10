package com.project.task_collap.user;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.project.task_collap.config.jwt.JwtUtil;
import com.project.task_collap.user.dtos.LoginRequest;
import com.project.task_collap.user.dtos.LoginResponse;
import com.project.task_collap.user.dtos.UserRequest;
import com.project.task_collap.user.dtos.UserResponse;
import com.project.task_collap.user.mapper.UserMapper;

@Service
public class UserService {

    private final PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;

    private final AuthenticationManager authenticationManager;

    private final JwtUtil jwtUtil;

    public UserService(PasswordEncoder passwordEncoder, UserRepository userRepository,
            AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    public UserResponse createUser(UserRequest userRequest) throws ResponseStatusException {
        if (Boolean.TRUE.equals(userRepository.existsByUsername(userRequest.username()))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User Name Already Taken");
        }
        if (Boolean.TRUE.equals(userRepository.existsByEmail(userRequest.email()))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email Already Taken");
        }

        User user = new User();
        user.setUsername(userRequest.username());
        user.setEmail(userRequest.email());
        user.setPasswordHash(passwordEncoder.encode(userRequest.password()));

        userRepository.save(user);
        return UserMapper.userToUserResponse(user);
    }

    public LoginResponse loginUser(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));

        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username Not Found"));

        String token = jwtUtil.generateToken(user.getUsername(), user.getId());

        return new LoginResponse(token, user.getUsername(), user.getId());

    }



    public UserResponse currentUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username Not Found"));
        return UserMapper.userToUserResponse(user);
    }

    public List<UserResponse> searchUser(String query) {
        List<User> user = userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
        return user.stream().map(UserMapper::userToUserResponse).toList();
    }

}
