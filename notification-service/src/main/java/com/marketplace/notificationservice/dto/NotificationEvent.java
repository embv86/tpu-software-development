package com.marketplace.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationEvent implements Serializable {
    private Long userId;          // Кому предназначено уведомление
    private String type;          // Тип: NEW_MESSAGE, LISTING_APPROVED, NEW_PRICE
    private String title;         // Заголовок уведомления
    private String message;       // Текст уведомления
    private Map<String, Object> payload; // Дополнительные данные (например, listingId или chatId)
}