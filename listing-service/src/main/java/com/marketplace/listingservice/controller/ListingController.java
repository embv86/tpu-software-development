package com.marketplace.listingservice.controller;

import com.marketplace.listingservice.dto.CreateListingRequest;
import com.marketplace.listingservice.dto.ListingResponse;
import com.marketplace.listingservice.entity.Listing;
import com.marketplace.listingservice.service.ListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;

    @PostMapping
    public ResponseEntity<Listing> createListing(@RequestBody CreateListingRequest request) {
        Long ownerId = getCurrentUserId();
        Listing created = listingService.createListing(request, ownerId);
        return ResponseEntity.ok(created);
    }

    // 1. Получить все объявления (Доступно всем, даже без токена)
    @GetMapping
    public ResponseEntity<List<Listing>> getAllListings() {
        return ResponseEntity.ok(listingService.getAllListings());
    }

    // 2. Получить объявление по ID (Доступно всем)
    @GetMapping("/{id}")
    public ResponseEntity<ListingResponse> getListingById(@PathVariable Long id) {
        return ResponseEntity.ok(listingService.getListingDetails(id));
    }

    // 3. Обновить объявление (Нужен токен)
    @PutMapping("/{id}")
    public ResponseEntity<Listing> updateListing(@PathVariable Long id, @RequestBody CreateListingRequest request) {
        Long currentUserId = getCurrentUserId();
        Listing updated = listingService.updateListing(id, request, currentUserId);
        return ResponseEntity.ok(updated);
    }

    // 4. Удалить объявление (Нужен токен)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(@PathVariable Long id) {
        Long currentUserId = getCurrentUserId();
        listingService.deleteListing(id, currentUserId);
        return ResponseEntity.noContent().build(); // Возвращает 24 No Content при успешном удалении
    }

    // Вынес парсинг ID в отдельный приватный метод, чтобы не дублировать код
    private Long getCurrentUserId() {
        String currentUserIdStr = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return Long.parseLong(currentUserIdStr);
    }
}