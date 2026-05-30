package com.marketplace.listingservice.service;

import org.springframework.transaction.annotation.Transactional;
import com.marketplace.listingservice.client.UserClient;
import com.marketplace.listingservice.config.RabbitMqConfig; // Проверяй маленькую q!
import com.marketplace.listingservice.dto.CreateListingRequest;
import com.marketplace.listingservice.dto.ListingImageMessage;
import com.marketplace.listingservice.dto.ListingResponse;
import com.marketplace.listingservice.dto.UserDto;
import com.marketplace.listingservice.entity.Listing;
import com.marketplace.listingservice.repository.ListingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ListingService {

    private final ListingRepository listingRepository;
    private final UserClient userClient;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public Listing createListing(CreateListingRequest request, Long ownerId) {
        Listing listing = Listing.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .ownerId(ownerId)
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .build();

        Listing savedListing = listingRepository.save(listing);

        if (request.getImageIds() != null && !request.getImageIds().isEmpty()) {
            ListingImageMessage message = new ListingImageMessage(
                    savedListing.getId(),
                    request.getImageIds(),
                    "CREATE"
            );

            // Используем правильное имя конфига с маленькой q
            rabbitTemplate.convertAndSend(
                    RabbitMqConfig.IMAGE_EXCHANGE,
                    RabbitMqConfig.PROCESS_ROUTING_KEY,
                    message
            );
            log.info(">>> [LISTING-SERVICE] Отправлено сообщение CREATE для картинок объявления ID: {}", savedListing.getId());
        }

        return savedListing;
    }

    public List<Listing> getAllListings() {
        return listingRepository.findAll();
    }

    public Listing getListingById(Long id) {
        return listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Объявление с id " + id + " не найдено"));
    }

    @Transactional
    public Listing updateListing(Long id, CreateListingRequest request, Long currentUserId) {
        Listing listing = getListingById(id);

        if (!listing.getOwnerId().equals(currentUserId)) {
            throw new RuntimeException("У вас нет прав на редактирование этого объявления");
        }

        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setPrice(request.getPrice());

        Listing updatedListing = listingRepository.save(listing);

        if (request.getImageIds() != null) {
            ListingImageMessage message = new ListingImageMessage(
                    updatedListing.getId(),
                    request.getImageIds(),
                    "UPDATE"
            );

            // Используем правильное имя конфига с маленькой q
            rabbitTemplate.convertAndSend(
                    RabbitMqConfig.IMAGE_EXCHANGE,
                    RabbitMqConfig.PROCESS_ROUTING_KEY,
                    message
            );
            log.info(">>> [LISTING-SERVICE] Отправлено сообщение UPDATE для картинок объявления ID: {}", updatedListing.getId());
        }

        return updatedListing;
    }

    @Transactional
    public void deleteListing(Long id, Long currentUserId) {
        Listing listing = getListingById(id);

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
            log.error("Ошибка вызова user-service через Feign: {}", e.getMessage());
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

    @Transactional
    public void deleteAllListingsByOwnerId(Long ownerId) {
        log.info(">>> [LISTING SERVICE] Начинаем удаление всех объявлений для пользователя с ID: {}", ownerId);
        listingRepository.deleteAllByOwnerId(ownerId);
        log.info(">>> [LISTING SERVICE] Все объявления пользователя успешно удалены из базы данных.");
    }
}