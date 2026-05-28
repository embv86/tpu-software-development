package com.marketplace.userservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.amqp.rabbit.core.RabbitAdmin;

@SpringBootApplication
public class UserServiceApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(UserServiceApplication.class, args);

        // Принудительно достаем бин администратора Кролика, чтобы он создал очереди прямо сейчас
        try {
            RabbitAdmin rabbitAdmin = context.getBean(RabbitAdmin.class);
            rabbitAdmin.initialize();
            System.out.println(">>> [RABBITMQ] Очереди успешно инициализированы при старте! <<<");
        } catch (Exception e) {
            System.err.println(">>> [RABBITMQ] Ошибка инициализации очередей: " + e.getMessage());
        }
    }
}