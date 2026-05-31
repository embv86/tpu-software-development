package com.marketplace.chatservice.service;

import com.marketplace.chatservice.entity.ChatRoom;
import com.marketplace.chatservice.entity.Message;
import com.marketplace.chatservice.repository.ChatRoomRepository;
import com.marketplace.chatservice.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;

    public Message sendMessage(Long listingId, Long buyerId, Long sellerId, Long senderId, String text) {
        // Ищем комнату или создаем новую, если её нет
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

        // Получатель — это тот, кто НЕ является отправителем
        Long recipientId = senderId.equals(buyerId) ? sellerId : buyerId;

        Message message = Message.builder()
                .chatRoomId(room.getId())
                .senderId(senderId)
                .recipientId(recipientId)
                .text(text)
                .createdAt(LocalDateTime.now())
                .build();

        return messageRepository.save(message);
    }

    public List<Message> getChatHistory(Long listingId, Long buyerId, Long sellerId) {
        ChatRoom room = chatRoomRepository.findByListingIdAndBuyerIdAndSellerId(listingId, buyerId, sellerId)
                .orElseThrow(() -> new RuntimeException("Чат для данного объявления еще не создан"));
        return messageRepository.findAllByChatRoomIdOrderByCreatedAtAsc(room.getId());
    }

    // === ВОТ ЭТИ ДВА МЕТОДА Я ЗАБЫЛ ДОБАВИТЬ ===

    public List<ChatRoom> getRoomsByBuyer(Long buyerId) {
        return chatRoomRepository.findAllByBuyerIdOrderByCreatedAtDesc(buyerId);
    }

    public List<ChatRoom> getRoomsBySeller(Long sellerId) {
        return chatRoomRepository.findAllBySellerIdOrderByCreatedAtDesc(sellerId);
    }

    // Добавь этот метод в самый низ твоего com.marketplace.chatservice.service.ChatService:

    @org.springframework.transaction.annotation.Transactional // Гарантирует, что всё удалится вместе
    public void deleteChat(Long roomId) {
        // 1. Проверяем, существует ли вообще такой чат
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Чат с ID " + roomId + " не найден"));

        // 2. Удаляем все сообщения, привязанные к этому чату
        messageRepository.deleteAllByChatRoomId(room.getId());
        System.out.println(">>> [CHAT-SERVICE] Сообщения для чата #" + roomId + " удалены.");

        // 3. Удаляем саму комнату чата
        chatRoomRepository.delete(room);
        System.out.println(">>> [CHAT-SERVICE] Комната чата #" + roomId + " полностью удалена.");
    }
}