package com.marketplace.chatservice.controller;

import com.marketplace.chatservice.entity.ChatRoom;
import com.marketplace.chatservice.entity.Message;
import com.marketplace.chatservice.service.ChatService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(@RequestBody SendMessageRequest request) {
        Message message = chatService.sendMessage(
                request.getListingId(),
                request.getBuyerId(),
                request.getSellerId(),
                request.getSenderId(),
                request.getText()
        );
        return ResponseEntity.ok(message);
    }

    @GetMapping("/history")
    public ResponseEntity<List<Message>> getHistory(
            @RequestParam Long listingId,
            @RequestParam Long buyerId,
            @RequestParam Long sellerId) {
        return ResponseEntity.ok(chatService.getChatHistory(listingId, buyerId, sellerId));
    }

    @GetMapping("/rooms")
    public ResponseEntity<UserChatsResponse> getUserRooms(@RequestParam Long userId) {
        List<ChatRoom> buying = chatService.getRoomsByBuyer(userId);
        List<ChatRoom> selling = chatService.getRoomsBySeller(userId);
        return ResponseEntity.ok(new UserChatsResponse(buying, selling));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChat(@PathVariable Long id) {
        chatService.deleteChat(id); // Вызывает метод, который мы только что написали выше
        return ResponseEntity.noContent().build(); // Возвращает статус 204 No Content (успешно)
    }
}

// Простой DTO класс для ответа (можно кинуть в этот же файл в самый низ)
@Data
@AllArgsConstructor
class UserChatsResponse {
    private List<ChatRoom> buying;
    private List<ChatRoom> selling;
}

@Data
class SendMessageRequest {
    private Long listingId;
    private Long buyerId;
    private Long sellerId;
    private Long senderId;
    private String text;
}