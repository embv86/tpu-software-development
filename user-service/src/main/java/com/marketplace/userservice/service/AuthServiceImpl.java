package com.marketplace.userservice.service;

import com.marketplace.userservice.dto.*;
import com.marketplace.userservice.entity.Role;
import com.marketplace.userservice.entity.User;
import com.marketplace.userservice.config.JwtUtils;
import com.marketplace.userservice.messaging.UserEventPublisher;
import com.marketplace.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserEventPublisher userEventPublisher;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }
        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Error: Phone number is already in use!");
        }

        System.out.println(">>> [LOGIN DEBUG] Полученный пароль до хэширования '" + request.getPassword() + "'");

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .city(request.getCity())
                .roles(Set.of(Role.ROLE_USER)) // По умолчанию даем роль обычного юзера
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtUtils.generateToken(savedUser);

        System.out.println(">>> [LOGIN DEBUG] Хэш из данных пароля + '" + token +"'");

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRoles().stream().map(Enum::name).collect(Collectors.toList())
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Error: User not found!"));

        System.out.println(">>> [LOGIN DEBUG] Полученный пароль до хэширования '" + request.getPassword() + "'");

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Error: Invalid password!");
        }

        String token = jwtUtils.generateToken(user);

        System.out.println(">>> [LOGIN DEBUG] Хэш из данных пароля + '" + token +"'");

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getRoles().stream().map(Enum::name).collect(Collectors.toList())
        );
    }
}