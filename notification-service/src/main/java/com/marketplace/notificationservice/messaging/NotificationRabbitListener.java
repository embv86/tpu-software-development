package com.marketplace.notificationservice.messaging;

import com.marketplace.notificationservice.config.RabbitMQConfig;
import com.marketplace.notificationservice.dto.NotificationEvent;
import com.marketplace.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class NotificationRabbitListener {

    private final NotificationService notificationService;

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void handleNotificationEvent(NotificationEvent event) {
        log.info(">>> [NOTIFICATOR] Получено событие для пользователя {}: {}", event.getUserId(), event.getTitle());
        try {
            notificationService.sendNotification(event);
        } catch (Exception e) {
            log.error("Ошибка обработки уведомления: {}", e.getMessage());
        }
    }
}