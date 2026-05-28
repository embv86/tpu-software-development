package com.marketplace.listingservice.config;

import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    // Имя очереди, которую мы будем слушать (точно такое же, как в user-service)
    public static final String USER_DELETED_LISTING_QUEUE = "user.deleted.listing.queue";

    // Конвертер для автоматического превращения JSON в Java-объекты (DTO)
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}