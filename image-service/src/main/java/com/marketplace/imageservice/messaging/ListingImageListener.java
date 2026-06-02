package com.marketplace.imageservice.messaging;

import com.marketplace.imageservice.dto.ListingImageMessage;
import com.marketplace.imageservice.entity.Image;
import com.marketplace.imageservice.repository.ImageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ListingImageListener {

    private final ImageRepository imageRepository;

    @RabbitListener(queues = "image.process.queue")
    @Transactional
    public void handleListingImageEvent(ListingImageMessage message) {
        log.info(">>> [IMAGE-SERVICE] Получено сообщение из RabbitMQ для объявления ID: {}", message.getListingId());

        if ("UPDATE".equals(message.getActionType())) {
            List<Image> oldImages = imageRepository.findByListingId(message.getListingId());
            for (Image img : oldImages) {
                img.setListingId(null);
                imageRepository.save(img);
            }
            log.info(">>> [IMAGE-SERVICE] Старые связи для объявления {} успешно сброшены", message.getListingId());
        }

        if (message.getImageIds() != null && !message.getImageIds().isEmpty()) {
            for (String fileId : message.getImageIds()) {
                imageRepository.findByFileId(fileId).ifPresentOrElse(
                        imageEntity -> {
                            imageEntity.setListingId(message.getListingId());
                            imageRepository.save(imageEntity);
                            log.info(">>> [IMAGE-SERVICE] Картинка {} привязана к объявлению {}", fileId, message.getListingId());
                        },
                        () -> log.warn(">>> [IMAGE-SERVICE] Картинка с fileId {} не найдена в БД!", fileId)
                );
            }
        }
    }
}