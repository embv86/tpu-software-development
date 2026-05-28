package com.marketplace.listingservice.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ListingResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private String status;
    private LocalDateTime createdAt;
    private UserDto owner; // Вместо простого Long ownerId возвращаем объект юзера!
}