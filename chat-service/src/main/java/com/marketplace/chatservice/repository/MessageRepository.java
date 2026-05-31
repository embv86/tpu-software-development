package com.marketplace.chatservice.repository;

import com.marketplace.chatservice.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findAllByChatRoomIdOrderByCreatedAtAsc(Long chatRoomId);

    // ВОТ ЭТОТ МЕТОД ДОБАВЛЯЕМ:
    @Modifying
    @Transactional // Обязательно для операций изменения/удаления в репозитории
    void deleteAllByChatRoomId(Long chatRoomId);
}