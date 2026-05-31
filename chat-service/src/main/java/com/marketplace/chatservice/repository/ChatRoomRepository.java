package com.marketplace.chatservice.repository;

import com.marketplace.chatservice.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findByListingIdAndBuyerIdAndSellerId(Long listingId, Long buyerId, Long sellerId);

    // Найти все чаты, где юзер — покупатель
    List<ChatRoom> findAllByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    // Найти все чаты, где юзер — продавец
    List<ChatRoom> findAllBySellerIdOrderByCreatedAtDesc(Long sellerId);
}