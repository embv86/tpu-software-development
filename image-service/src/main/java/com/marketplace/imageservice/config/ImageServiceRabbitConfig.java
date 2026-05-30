package com.marketplace.imageservice.config;

import io.minio.MinioClient;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ImageServiceRabbitConfig {

    public static final String IMAGE_EXCHANGE = "image.exchange";
    public static final String PROCESS_IMAGES_QUEUE = "image.process.queue";
    public static final String IMAGES_READY_QUEUE = "image.ready.queue";

    public static final String PROCESS_ROUTING_KEY = "listing.images.process";
    public static final String READY_ROUTING_KEY = "listing.images.ready";

    @Bean
    public TopicExchange imageExchange() {
        return new TopicExchange(IMAGE_EXCHANGE);
    }

    @Bean
    public Queue processImagesQueue() {
        return new Queue(PROCESS_IMAGES_QUEUE, true);
    }

    @Bean
    public Binding bindingProcess(Queue processImagesQueue, TopicExchange imageExchange) {
        return BindingBuilder.bind(processImagesQueue).to(imageExchange).with(PROCESS_ROUTING_KEY);
    }

    // Очередь для уведомлений о готовности изображений (другие сервисы будут её слушать)
    @Bean
    public Queue imagesReadyQueue() {
        return new Queue(IMAGES_READY_QUEUE, true);
    }

    @Bean
    public Binding bindingReady(Queue imagesReadyQueue, TopicExchange imageExchange) {
        return BindingBuilder.bind(imagesReadyQueue).to(imageExchange).with(READY_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public org.springframework.amqp.rabbit.connection.ConnectionFactory connectionFactory(
            @Value("${spring.rabbitmq.host}") String host,
            @Value("${spring.rabbitmq.port}") int port,
            @Value("${spring.rabbitmq.username}") String user,
            @Value("${spring.rabbitmq.password}") String pass) {
        CachingConnectionFactory cf = new CachingConnectionFactory(host, port);
        cf.setUsername(user);
        cf.setPassword(pass);
        return cf;
    }

    // Бин для работы с MinIO
    @Value("${minio.endpoint}") private String minioEndpoint;
    @Value("${minio.accessKey}") private String minioAccessKey;
    @Value("${minio.secretKey}") private String minioSecretKey;

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(minioEndpoint)
                .credentials(minioAccessKey, minioSecretKey)
                .build();
    }
}