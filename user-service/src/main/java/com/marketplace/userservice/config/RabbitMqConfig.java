package com.marketplace.userservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    public static final String USER_EXCHANGE = "user.exchange";
    public static final String USER_DELETED_LISTING_QUEUE = "user.deleted.listing.queue";
    public static final String USER_DELETED_ROUTING_KEY = "user.event.deleted";

    // Бин, который берет на себя автоматическое создание сущностей в Кролике при старте
    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) {
        RabbitAdmin admin = new RabbitAdmin(connectionFactory);
        // Заставляем его инициализироваться немедленно
        admin.initialize();
        return admin;
    }

    @Bean
    public TopicExchange userExchange() {
        TopicExchange exchange = new TopicExchange(USER_EXCHANGE);
        return exchange;
    }

    @Bean
    public Queue userDeletedListingQueue() {
        return new Queue(USER_DELETED_LISTING_QUEUE, true);
    }

    @Bean
    public Binding bindingUserDeleted(Queue userDeletedListingQueue, TopicExchange userExchange) {
        return BindingBuilder.bind(userDeletedListingQueue).to(userExchange).with(USER_DELETED_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}