package com.marketplace.listingservice.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    // 1. Твоя существующая очередь для удаления объявлений при удалении юзера
    public static final String USER_DELETED_LISTING_QUEUE = "user.deleted.listing.queue";

    // 2. Наши новые константы для отправки картинок в Exchange Сервиса Картинок
    public static final String IMAGE_EXCHANGE = "image.exchange";
    public static final String PROCESS_ROUTING_KEY = "listing.images.process";

    // Регистрируем бин Exchange, чтобы листинг-сервис знал, куда отправлять сообщения
    @Bean
    public TopicExchange imageExchange() {
        return new TopicExchange(IMAGE_EXCHANGE);
    }

    // Конвертер для автоматического превращения Java-объектов (DTO) в JSON и обратно
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}