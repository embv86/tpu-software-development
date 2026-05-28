package com.marketplace.listingservice.dto;

import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String email;
    // Сюда можно добавить firstName, lastName, если они есть у тебя в User entity
}