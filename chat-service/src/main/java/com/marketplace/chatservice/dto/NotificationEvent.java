package com.marketplace.chatservice.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationEvent {
    private Long userId;
    private String type;
    private String title;
    private String message;
    private Object payload;
}