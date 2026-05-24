package com.marketplace.userservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class UserServiceApplication { // Убедись, что тут нет лишней "s"

    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}