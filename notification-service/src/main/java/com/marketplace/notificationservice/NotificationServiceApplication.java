package com.marketplace.notificationservice;

import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

@SpringBootApplication
public class NotificationServiceApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(NotificationServiceApplication.class, args);

        try {
            RabbitAdmin rabbitAdmin = context.getBean(RabbitAdmin.class);
            rabbitAdmin.initialize();
            System.out.println(">>> [RABBITMQ] Очереди сервиса уведомлений успешно инициализированы! <<<");
        } catch (Exception e) {
            System.err.println(">>> [RABBITMQ] Не удалось принудительно инициализировать очереди: " + e.getMessage());
        }
    }
}