package com.marketplace.notificationservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-notifications")
                .setAllowedOriginPatterns("*"); // Просто убрали .withSockJS()
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Префикс для топиков, на которые фронтенд будет подписываться
        // Например, подписка на /user/queue/notifications
        registry.enableSimpleBroker("/queue", "/topic");

        // Префикс для сообщений, которые идут от фронтенда к бэкенду (если понадобятся)
        registry.setApplicationDestinationPrefixes("/app");

        // Префикс для персональных уведомлений конкретного пользователя
        registry.setUserDestinationPrefix("/user");
    }
}