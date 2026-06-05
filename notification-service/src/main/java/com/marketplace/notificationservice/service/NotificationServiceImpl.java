package com.marketplace.notificationservice.service;

import com.marketplace.notificationservice.dto.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void sendNotification(NotificationEvent event) {
        log.info(">>> [WEBSOCKET] Пересылка уведомления для пользователя ID: {}", event.getUserId());
        try {
            String destination = "/topic/notifications." + event.getUserId();

            messagingTemplate.convertAndSend(destination, event);

            log.info(">>> [WEBSOCKET] Уведомление успешно отправлено в топик: {} <<<", destination);
        } catch (Exception e) {
            log.error(">>> [WEBSOCKET] Ошибка отправки через WebSocket: {}", e.getMessage());
        }
    }
}