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
import com.project.task_collap.user.dtos.UserRequest;
import com.project.task_collap.user.dtos.UserResponce;
import com.project.task_collap.user.mapper.UserMapper;

@Service
public class UserService {

    private final PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;

    private final UserMapper userMapper;

    private final AuthenticationManager authenticationManager;

    private final JwtUtil jwtUtil;

    public UserService(PasswordEncoder passwordEncoder, UserRepository userRepository, UserMapper userMapper,
            AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    public UserResponce createUser(UserRequest userRequest) throws ResponseStatusException {
        if (Boolean.TRUE.equals(userRepository.existsByUsername(userRequest.username()))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User Name Already Taken");
        }

        User user = new User();
        user.setUsername(userRequest.username());
        user.setEmail(userRequest.email());
        user.setPasswordHash(passwordEncoder.encode(userRequest.password()));

        userRepository.save(user);
        return userMapper.userToUserResponce(user);
    }

    public String loginUser(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));

        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username Not Found"));

        return jwtUtil.generateToken(user.getUsername(), user.getId());

    }

    public List<UserResponce> allUsers() {
        return userRepository.findAll().stream().map(userMapper::userToUserResponce).toList();
    }

}
