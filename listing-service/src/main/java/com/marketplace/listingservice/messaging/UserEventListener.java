package com.marketplace.listingservice.messaging;

import com.marketplace.listingservice.config.RabbitMqConfig;
import com.marketplace.listingservice.dto.UserDeletedEvent;
import com.marketplace.listingservice.service.ListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserEventListener {

    private final ListingService listingService;

    // Аннотация заставляет Спринг непрерывно слушать указанную очередь
    @RabbitListener(queues = RabbitMqConfig.USER_DELETED_LISTING_QUEUE)
    public void handleUserDeleted(UserDeletedEvent event) {
        System.out.println(">>> [RABBITMQ CONSUMER] Поймали сообщение об удалении пользователя! ID: " + event.getUserId());

        // Вызываем нашу логику подчистки объявлений
        listingService.deleteAllListingsByOwnerId(event.getUserId());
    }
}