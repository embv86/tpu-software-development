package com.marketplace.userservice.service;

import com.marketplace.userservice.dto.UpdateProfileRequest;
import com.marketplace.userservice.entity.User;
import com.marketplace.userservice.messaging.UserEventPublisher;
import com.marketplace.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserEventPublisher userEventPublisher;

    @Override
    @Transactional
    public User updateUserProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        if (request.getFirstName() == null || request.getFirstName().trim().isEmpty()) {
            throw new IllegalArgumentException("Имя не может быть пустым");
        }

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName() != null ? request.getLastName().trim() : null);
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        user.setCity(request.getCity() != null ? request.getCity().trim() : null);

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("Error: User not found!");
        }

        userRepository.deleteById(userId);

        // Асинхронно пуляем ивент в RabbitMQ
        userEventPublisher.publishUserDeleted(userId);

        System.out.println(">>> [USER-SERVICE] Отправлено событие удаления юзера через UserServiceImpl: " + userId);
    }
}