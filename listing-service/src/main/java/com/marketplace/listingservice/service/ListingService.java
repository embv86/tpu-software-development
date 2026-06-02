package com.marketplace.listingservice.service;

import com.marketplace.listingservice.dto.*;
import org.springframework.transaction.annotation.Transactional;
import com.marketplace.listingservice.client.UserClient;
import com.marketplace.listingservice.config.RabbitMqConfig;
import com.marketplace.listingservice.entity.Listing;
import com.marketplace.listingservice.entity.ListingImage;
import com.marketplace.listingservice.repository.ListingRepository;
import com.marketplace.listingservice.repository.ListingImageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ListingService {

    private final ListingRepository listingRepository;
    private final ListingImageRepository listingImageRepository; // Подключаем репозиторий картинок
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

            rabbitTemplate.convertAndSend(
                    RabbitMqConfig.IMAGE_EXCHANGE,
                    RabbitMqConfig.PROCESS_ROUTING_KEY,
                    message
            );
            log.info(">>> [LISTING-SERVICE] Отправлено сообщение CREATE для картинок объявления ID: {}", savedListing.getId());
        }

        try {
            NotificationEvent notification = NotificationEvent.builder()
                    .userId(ownerId)
                    .type("LISTING_CREATED")
                    .title("Уведомление Deala")
                    .message(String.format("Объявление «%s» успешно создано и опубликовано в каталоге!", savedListing.getTitle()))
                    .build();

            rabbitTemplate.convertAndSend(
                    "marketplace.exchange",
                    "notification.routing.key",
                    notification
            );
            log.info(">>> [LISTING-SERVICE] Отправлено автоматическое уведомление для пользователя ID: {}", ownerId);
        } catch (Exception e) {
            log.error(">>> [LISTING-SERVICE] Не удалось отправить уведомление в RabbitMQ: {}", e.getMessage());
        }

        return savedListing;
    }

    public List<ListingResponse> getAllListings(Long ownerId) {
        List<Listing> listings;

        if (ownerId != null) {
            log.info("Запрос на получение объявлений конкретного пользователя с ID: {}", ownerId);
            listings = listingRepository.findAllByOwnerId(ownerId);
        } else {
            log.info("Запрос на получение всех объявлений (Каталог)");
            listings = listingRepository.findAll();
        }

        return listings.stream()
                .map(this::enrichListingData)
                .collect(Collectors.toList());
    }

    public ListingResponse getListingDetails(Long id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Объявление с id " + id + " не найдено"));
        return enrichListingData(listing);
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

            rabbitTemplate.convertAndSend(
                    RabbitMqConfig.IMAGE_EXCHANGE,
                    RabbitMqConfig.PROCESS_ROUTING_KEY,
                    message
            );
            log.info(">>> [LISTING-SERVICE] Отправлено сообщение UPDATE для картинок объявления ID: {}", updatedListing.getId());
        }

        try {
            NotificationEvent notification = NotificationEvent.builder()
                    .userId(currentUserId)
                    .type("LISTING_UPDATED")
                    .title("Обновление Deala")
                    .message(String.format("Изменения в объявлении «%s» успешно сохранены!", updatedListing.getTitle()))
                    .build();

            rabbitTemplate.convertAndSend("marketplace.exchange", "notification.routing.key", notification);
            log.info(">>> [LISTING-SERVICE] Отправлено автоматическое уведомление об обновлении лота для пользователя ID: {}", currentUserId);
        } catch (Exception e) {
            log.error(">>> [LISTING-SERVICE] Не удалось отправить уведомление в RabbitMQ: {}", e.getMessage());
        }

        return updatedListing;
    }

    @Transactional
    public void deleteListing(Long id, Long currentUserId) {
        Listing listing = getListingById(id);

        if (!listing.getOwnerId().equals(currentUserId)) {
            throw new RuntimeException("У вас нет прав на удаление этого объявления");
        }

        String listingTitle = listing.getTitle();

        listingRepository.delete(listing);

        try {
            NotificationEvent notification = NotificationEvent.builder()
                    .userId(currentUserId)
                    .type("LISTING_DELETED")
                    .title("Удаление на Deala")
                    .message(String.format("Объявление «%s» было успешно удалено из системы.", listingTitle))
                    .build();

            rabbitTemplate.convertAndSend("marketplace.exchange", "notification.routing.key", notification);
            log.info(">>> [LISTING-SERVICE] Отправлено автоматическое уведомление об удалении лота для пользователя ID: {}", currentUserId);
        } catch (Exception e) {
            log.error(">>> [LISTING-SERVICE] Не удалось отправить уведомление в RabbitMQ: {}", e.getMessage());
        }
    }

    @Transactional
    public void deleteAllListingsByOwnerId(Long ownerId) {
        log.info(">>> [LISTING SERVICE] Начинаем удаление всех объявлений для пользователя с ID: {}", ownerId);
        listingRepository.deleteAllByOwnerId(ownerId);
        log.info(">>> [LISTING SERVICE] Все объявления пользователя успешно удалены из базы данных.");
    }

    private ListingResponse enrichListingData(Listing listing) {
        UserDto ownerDto = null;
        try {
            ownerDto = userClient.getUserById(listing.getOwnerId());
        } catch (Exception e) {
            log.error("Ошибка вызова user-service через Feign: {}", e.getMessage());
            ownerDto = UserDto.builder().id(listing.getOwnerId()).email("unknown@tpu.ru").firstName("Пользователь").build();
        }

        List<ImageDto> images = new ArrayList<>();
        try {
            List<ListingImage> dbImages = listingImageRepository.findAllByListingId(listing.getId());
            images = dbImages.stream()
                    .map(img -> ImageDto.builder()
                            .fileId(img.getFileId())
                            .processedUrl(img.getProcessedUrl())
                            .rawUrl(img.getRawUrl())
                            .build())
                    .collect(Collectors.toList());

            log.info("Для лота {} успешно загружено из БД картинок: {}", listing.getId(), images.size());
        } catch (Exception e) {
            log.error("Не удалось достать изображения из таблицы для лота {}: {}", listing.getId(), e.getMessage());
        }

        return ListingResponse.builder()
                .id(listing.getId())
                .title(listing.getTitle())
                .description(listing.getDescription())
                .price(listing.getPrice())
                .status(listing.getStatus())
                .createdAt(listing.getCreatedAt())
                .owner(ownerDto)
                .images(images)
                .build();
    }
}