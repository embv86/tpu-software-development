package com.marketplace.imageservice.dto;

import java.io.Serializable;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ListingImageMessage implements Serializable {
    private Long listingId;
    private List<String> imageIds; // Список наших fileId картинок
    private String actionType;     // "CREATE" или "UPDATE"
}