package com.marketplace.listingservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    public static final String USER_DELETED_LISTING_QUEUE = "user.deleted.listing.queue";

    public static final String IMAGE_EXCHANGE = "image.exchange";
    public static final String PROCESS_ROUTING_KEY = "listing.images.process";

    public static final String MARKETPLACE_EXCHANGE = "marketplace.exchange";
    public static final String NOTIFICATION_ROUTING_KEY = "notification.routing.key";

    @Bean
    public Queue userDeletedListingQueue() {
        return new Queue(USER_DELETED_LISTING_QUEUE, true); // true означает durable (очередь выдержит перезапуск брокера)
    }

    @Bean
    public TopicExchange marketplaceExchange() {
        return new TopicExchange(MARKETPLACE_EXCHANGE);
    }

    @Bean
    public TopicExchange imageExchange() {
        return new TopicExchange(IMAGE_EXCHANGE);
    }

    @Bean
    public Binding bindingUserDeleted(Queue userDeletedListingQueue, TopicExchange marketplaceExchange) {
        return BindingBuilder.bind(userDeletedListingQueue)
                .to(marketplaceExchange)
                .with("user.deleted.#"); // пример ключа маршрутизации
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}