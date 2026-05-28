package com.marketplace.userservice.controller;

import com.marketplace.userservice.entity.User;
import com.marketplace.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate; // Импортируем Кролика
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final RabbitTemplate rabbitTemplate; // Внедряем темплейт Кролика

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserProfile(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found!"));
        user.setPasswordHash(null);
        return ResponseEntity.ok(user);
    }

    // НАШ НОВЫЙ МЕТОД УДАЛЕНИЯ С ОТПРАВКОЙ В ОЧЕРЕДЬ
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        // 1. Проверяем, существует ли пользователь в БД
        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(404).body("User not found!");
        }

        // 2. Удаляем пользователя из нашей базы данных
        userRepository.deleteById(id);

        // 3. Отправляем ID удаленного пользователя в RabbitMQ
        // Название очереди берем с твоего скриншота: "user.deleted.listing.queue"
        rabbitTemplate.convertAndSend("user.deleted.listing.queue", id);

        System.out.println(">>> [USER-SERVICE] Отправлено сообщение об удалении юзера с ID: " + id);

        return ResponseEntity.ok("User deleted successfully and event sent to RabbitMQ!");
    }
}