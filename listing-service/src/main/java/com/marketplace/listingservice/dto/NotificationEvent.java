package com.marketplace.listingservice.dto;

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
}