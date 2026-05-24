package com.marketplace.userservice.controller;

import com.marketplace.userservice.entity.User;
import com.marketplace.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserProfile(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found!"));
        // Чтобы в ответе не возвращать хэш пароля
        user.setPasswordHash(null);
        return ResponseEntity.ok(user);
    }
}