package com.marketplace.listingservice.controller;

import com.marketplace.listingservice.dto.CreateListingRequest;
import com.marketplace.listingservice.entity.Listing;
import com.marketplace.listingservice.service.ListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;

    @PostMapping
    public ResponseEntity<Listing> createListing(@RequestBody CreateListingRequest request) {
        // Достаем X-User-Id, который прокинул Gateway и распарсил наш фильтр
        String currentUserIdStr = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long ownerId = Long.parseLong(currentUserIdStr);

        Listing created = listingService.createListing(request, ownerId);
        return ResponseEntity.ok(created);
    }
}