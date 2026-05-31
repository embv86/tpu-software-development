package com.marketplace.listingservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ListingResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private String status;
    private LocalDateTime createdAt;
    private UserDto owner; // Данные продавца из user-service
    private List<ImageDto> images; // Массив картинок, который мы только что создали!
}