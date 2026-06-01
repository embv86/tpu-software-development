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

    // Встроенный инструмент Spring для отправки сообщений через WebSocket
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void sendNotification(NotificationEvent event) {
        log.info(">>> [WEBSOCKET] Пересылка уведомления для пользователя ID: {}", event.getUserId());
        try {
            // Шлем строго по ID сессии
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(event.getUserId()),
                    "/queue/notifications",
                    event
            );
            log.info(">>> [WEBSOCKET] Уведомление успешно отправлено в сокет-канал пользователя {}! <<<", event.getUserId());
        } catch (Exception e) {
            log.error(">>> [WEBSOCKET] Ошибка отправки: {}", e.getMessage());
        }
    }
}