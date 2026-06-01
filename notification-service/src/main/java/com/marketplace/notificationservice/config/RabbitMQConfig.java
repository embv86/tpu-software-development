package com.marketplace.notificationservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String NOTIFICATION_QUEUE = "notification.queue";
    public static final String MARKETPLACE_EXCHANGE = "marketplace.exchange";
    public static final String NOTIFICATION_ROUTING_KEY = "notification.routing.key";

    @Bean
    public Queue notificationQueue() {
        return new Queue(NOTIFICATION_QUEUE, true); // durable = true
    }

    @Bean
    public TopicExchange marketplaceExchange() {
        return new TopicExchange(MARKETPLACE_EXCHANGE);
    }

    @Bean
    public Binding bindingNotification(Queue notificationQueue, TopicExchange marketplaceExchange) {
        return BindingBuilder.bind(notificationQueue).to(marketplaceExchange).with(NOTIFICATION_ROUTING_KEY);
    }

    // Преобразователь для автоматической конвертации JSON строк в Java DTO объекты
    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}