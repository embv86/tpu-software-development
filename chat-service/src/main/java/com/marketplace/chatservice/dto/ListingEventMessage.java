package com.marketplace.listingservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListingEventMessage implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long listingId;
    private Long ownerId;
    private String title;
    private String description;
    private BigDecimal price;
    private String eventType; // "CREATE" или "UPDATE"
}