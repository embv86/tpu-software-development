package com.marketplace.listingservice.service;

import com.marketplace.listingservice.client.UserClient;
import com.marketplace.listingservice.dto.CreateListingRequest;
import com.marketplace.listingservice.dto.ListingResponse;
import com.marketplace.listingservice.dto.UserDto;
import com.marketplace.listingservice.entity.Listing;
import com.marketplace.listingservice.repository.ListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingRepository listingRepository;
    private final UserClient userClient;

    public Listing createListing(CreateListingRequest request, Long ownerId) {
        Listing listing = Listing.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .ownerId(ownerId)
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .build();

        return listingRepository.save(listing);
    }

    // 1. Получить все объявления
    public List<Listing> getAllListings() {
        return listingRepository.findAll();
    }

    // 2. Получить конкретное объявление (Сюда мы потом прикрутим Feign!)
    public Listing getListingById(Long id) {
        return listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Объявление с id " + id + " не найдено"));
    }

    // 3. Обновить объявление (с проверкой на владельца)
    public Listing updateListing(Long id, CreateListingRequest request, Long currentUserId) {
        Listing listing = getListingById(id);

        // Защита: править может только автор
        if (!listing.getOwnerId().equals(currentUserId)) {
            throw new RuntimeException("У вас нет прав на редактирование этого объявления");
        }

        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.getPrice(); // если используешь сеттеры, или через @Setter Lombok'а:
        listing.setPrice(request.getPrice());

        return listingRepository.save(listing);
    }

    // 4. Удалить объявление (Сюда мы потом прикрутим RabbitMQ!)
    public void deleteListing(Long id, Long currentUserId) {
        Listing listing = getListingById(id);

        // Защита: удалять может только автор
        if (!listing.getOwnerId().equals(currentUserId)) {
            throw new RuntimeException("У вас нет прав на удаление этого объявления");
        }

        listingRepository.delete(listing);
    }

    public ListingResponse getListingDetails(Long id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Объявление не найдено"));

        UserDto ownerDto = null;
        try {
            ownerDto = userClient.getUserById(listing.getOwnerId());
        } catch (Exception e) {
            System.err.println("Ошибка вызова user-service через Feign: " + e.getMessage());
        }

        return ListingResponse.builder()
                .id(listing.getId())
                .title(listing.getTitle())
                .description(listing.getDescription())
                .price(listing.getPrice())
                .status(listing.getStatus())
                .createdAt(listing.getCreatedAt())
                .owner(ownerDto)
                .build();
    }
}