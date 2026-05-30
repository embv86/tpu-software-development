package com.marketplace.listingservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateListingRequest {
    private String title;
    private String description;
    private BigDecimal price;
    private List<String> imageIds; // Сюда Postman пришлет массив fileId, полученных от image-service
}