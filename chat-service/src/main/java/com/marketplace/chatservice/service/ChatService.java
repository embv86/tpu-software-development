package com.marketplace.chatservice.service;

import com.marketplace.chatservice.entity.ChatRoom;
import com.marketplace.chatservice.entity.Message;
import com.marketplace.chatservice.dto.NotificationEvent;
import com.marketplace.chatservice.repository.ChatRoomRepository;
import com.marketplace.chatservice.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate; // ДОБАВИЛИ ИМПОРТ ДЛЯ СОКЕТОВ СТАНДАРТА SPRING
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    private final RabbitTemplate rabbitTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    public Message sendMessage(Long listingId, Long buyerId, Long sellerId, Long senderId, String text) {
        ChatRoom room = chatRoomRepository.findByListingIdAndBuyerIdAndSellerId(listingId, buyerId, sellerId)
                .orElseGet(() -> {
                    ChatRoom newRoom = ChatRoom.builder()
                            .listingId(listingId)
                            .buyerId(buyerId)
                            .sellerId(sellerId)
                            .createdAt(LocalDateTime.now())
                            .build();
                    return chatRoomRepository.save(newRoom);
                });

        Long recipientId = senderId.equals(buyerId) ? sellerId : buyerId;

        Message message = Message.builder()
                .chatRoomId(room.getId())
                .senderId(senderId)
                .recipientId(recipientId)
                .text(text)
                .createdAt(LocalDateTime.now())
                .build();

        Message savedMessage = messageRepository.save(message);

        try {
            NotificationEvent notification = NotificationEvent.builder()
                    .userId(recipientId)
                    .type("NEW_MESSAGE")
                    .title("Новое сообщение")
                    .message(text.length() > 40 ? text.substring(0, 37) + "..." : text)
                    .payload(savedMessage)
                    .build();

            rabbitTemplate.convertAndSend(
                    "marketplace.exchange",
                    "notification.routing.key",
                    notification
            );
            log.info(">>> [CHAT-SERVICE] Сообщение и триггер отправлены в RabbitMQ для пользователя ID: {}", recipientId);
        } catch (Exception e) {
            log.error(">>> [CHAT-SERVICE] Не удалось отправить сообщение в RabbitMQ: {}", e.getMessage());
        }

        return savedMessage;
    }

    public List<Message> getChatHistory(Long listingId, Long buyerId, Long sellerId) {
        ChatRoom room = chatRoomRepository.findByListingIdAndBuyerIdAndSellerId(listingId, buyerId, sellerId)
                .orElseThrow(() -> new RuntimeException("Чат для данного объявления еще не создан"));
        return messageRepository.findAllByChatRoomIdOrderByCreatedAtAsc(room.getId());
    }

    public List<ChatRoom> getRoomsByBuyer(Long buyerId) {
        return chatRoomRepository.findAllByBuyerIdOrderByCreatedAtDesc(buyerId);
    }

    public List<ChatRoom> getRoomsBySeller(Long sellerId) {
        return chatRoomRepository.findAllBySellerIdOrderByCreatedAtDesc(sellerId);
    }

    @Transactional
    public void deleteChat(Long roomId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Чат с ID " + roomId + " не найден"));

        messageRepository.deleteAllByChatRoomId(room.getId());
        log.info(">>> [CHAT-SERVICE] Сообщения для чата #{} удалены.", roomId);

        chatRoomRepository.delete(room);
        log.info(">>> [CHAT-SERVICE] Комната чата #{} полностью удалена.", roomId);
    }
}