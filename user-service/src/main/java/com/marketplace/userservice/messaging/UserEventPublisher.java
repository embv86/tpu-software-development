package com.marketplace.userservice.messaging;

import com.marketplace.userservice.config.RabbitMqConfig;
import com.marketplace.userservice.dto.UserDeletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishUserDeleted(Long userId) {
        UserDeletedEvent event = new UserDeletedEvent(userId);

        log.info("Отправка события удаления пользователя в RabbitMQ для ID: {}", userId);

        rabbitTemplate.convertAndSend(
                RabbitMqConfig.USER_EXCHANGE,
                RabbitMqConfig.USER_DELETED_ROUTING_KEY,
                event
        );
    }
}