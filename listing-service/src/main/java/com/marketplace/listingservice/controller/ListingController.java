package com.marketplace.listingservice.controller;

import com.marketplace.listingservice.dto.CreateListingRequest;
import com.marketplace.listingservice.dto.ListingResponse;
import com.marketplace.listingservice.entity.Listing;
import com.marketplace.listingservice.service.ListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Перепроверь импорт, если у тебя используется старая версия Spring Boot (2.x), замени jakarta на javax
import jakarta.security.auth.message.config.RegistrationListener;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@RestController
@RequestMapping("/api/v1/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;

    // Создать объявление
    @PostMapping
    public ResponseEntity<Listing> createListing(@RequestBody CreateListingRequest request) {
        Long ownerId = getCurrentUserId();
        Listing created = listingService.createListing(request, ownerId);
        return ResponseEntity.ok(created);
    }

    // Получить все объявления (с поддержкой фильтрации по владельцу)
    @GetMapping
    public ResponseEntity<List<ListingResponse>> getAllListings(
            @RequestParam(value = "ownerId", required = false) Long ownerId) {

        List<ListingResponse> listings = listingService.getAllListings(ownerId);
        return ResponseEntity.ok(listings);
    }

    // Получить конкретное объявление по ID
    @GetMapping("/{id}")
    public ResponseEntity<ListingResponse> getListingById(@PathVariable Long id) {
        return ResponseEntity.ok(listingService.getListingDetails(id));
    }

    // Обновить объявление
    @PutMapping("/{id}")
    public ResponseEntity<Listing> updateListing(@PathVariable Long id, @RequestBody CreateListingRequest request) {
        Long currentUserId = getCurrentUserId();
        Listing updated = listingService.updateListing(id, request, currentUserId);
        return ResponseEntity.ok(updated);
    }

    // Удалить объявление
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(@PathVariable Long id) {
        Long currentUserId = getCurrentUserId();
        listingService.deleteListing(id, currentUserId);
        return ResponseEntity.noContent().build();
    }

    // Приватный хелпер для извлечения ID юзера из SecurityContext
    private Long getCurrentUserId() {
        String currentUserIdStr = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return Long.parseLong(currentUserIdStr);
    }
}