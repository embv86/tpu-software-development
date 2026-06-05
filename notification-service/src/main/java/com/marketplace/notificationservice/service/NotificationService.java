package com.marketplace.notificationservice.service;

import com.marketplace.notificationservice.dto.NotificationEvent;

public interface NotificationService {
    void sendNotification(NotificationEvent event);
}