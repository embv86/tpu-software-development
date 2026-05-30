package com.marketplace.imageservice.service;

import com.marketplace.imageservice.dto.ImageResponse;
import com.marketplace.imageservice.entity.Image;
import com.marketplace.imageservice.repository.ImageRepository;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.SetBucketPolicyArgs;
import io.minio.PutObjectArgs;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import net.coobird.thumbnailator.Thumbnails;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageService {

    private final MinioClient minioClient;
    private final ImageRepository imageRepository; // Инжектим репозиторий для записи в БД

    @Value("${minio.buckets.raw}")
    private String rawBucket;

    @Value("${minio.buckets.processed}")
    private String processedBucket;

    @Value("${minio.endpoint}")
    private String minioEndpoint;

    @Value("${image.target-width}")
    private int targetWidth;

    @Value("${image.jpeg-quality}")
    private double jpegQuality;

    @PostConstruct
    public void init() {
        initBucket(rawBucket);
        initBucket(processedBucket);
    }

    private void initBucket(String bucketName) {
        try {
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                log.info(">>> [MINIO] Бакет '{}' успешно создан", bucketName);

                String policyJson = """
                {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Principal": {"AWS": ["*"]},
                            "Action": ["s3:GetObject"],
                            "Resource": ["arn:aws:s3:::%s/*"]
                        }
                    ]
                }
                """.formatted(bucketName);

                minioClient.setBucketPolicy(
                        SetBucketPolicyArgs.builder().bucket(bucketName).config(policyJson).build()
                );
                log.info(">>> [MINIO] Права READ-ONLY для бакета '{}' успешно применены", bucketName);
            } else {
                log.info(">>> [MINIO] Бакет '{}' уже существует", bucketName);
            }
        } catch (Exception e) {
            log.error(">>> [MINIO] Ошибка при инициализации бакета '" + bucketName + "': ", e);
        }
    }

    /**
     * Новый метод для массовой обработки списка файлов (до 10 штук)
     */
    public List<ImageResponse> processAndUploadMultiple(List<MultipartFile> files) {
        List<ImageResponse> responses = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            try {
                String originalFilename = file.getOriginalFilename();
                // Генерируем чистый UUID как базовый идентификатор файла
                String uniqueId = UUID.randomUUID().toString();
                String cleanName = (originalFilename != null) ? originalFilename.replaceAll("\\s+", "_") : "image.jpg";

                String fileId = uniqueId + "-" + cleanName;
                String rawFileName = "raw-" + fileId;
                String processedFileName = "proc-" + fileId;

                // 1. Сохраняем ОРИГИНАЛ в бакет raw-images
                try (InputStream inputStream = file.getInputStream()) {
                    minioClient.putObject(
                            PutObjectArgs.builder()
                                    .bucket(rawBucket)
                                    .object(rawFileName)
                                    .stream(inputStream, file.getSize(), -1)
                                    .contentType(file.getContentType())
                                    .build()
                    );
                }

                // 2. ОБРАБОТКА (Ресайз и сжатие через Thumbnailator)
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                Thumbnails.of(file.getInputStream())
                        .width(targetWidth)
                        .outputQuality(jpegQuality)
                        .outputFormat("jpg")
                        .toOutputStream(outputStream);

                byte[] processedBytes = outputStream.toByteArray();

                // 3. Сохраняем СЖАТУЮ копию в бакет market-images
                try (ByteArrayInputStream processedInputStream = new ByteArrayInputStream(processedBytes)) {
                    minioClient.putObject(
                            PutObjectArgs.builder()
                                    .bucket(processedBucket)
                                    .object(processedFileName)
                                    .stream(processedInputStream, processedBytes.length, -1)
                                    .contentType("image/jpeg")
                                    .build()
                    );
                }

                // Формируем ссылки
                String externalEndpoint = minioEndpoint.replace("marketplace-minio", "localhost");
                String rawUrl = externalEndpoint + "/" + rawBucket + "/" + rawFileName;
                String processedUrl = externalEndpoint + "/" + processedBucket + "/" + processedFileName;

                // 4. СОХРАНЯЕМ В БД КАРТИНОК (listingId изначально равен null, проставится через RabbitMQ)
                Image imageEntity = new Image();
                imageEntity.setFileId(fileId); // Сохраняем базовый fileId для поиска через брокер
                imageEntity.setRawUrl(rawUrl);
                imageEntity.setProcessedUrl(processedUrl);
                imageEntity.setListingId(null);

                imageRepository.save(imageEntity);

                // Добавляем в список ответа
                responses.add(new ImageResponse(fileId, rawUrl, processedUrl));
                log.info(">>> [IMAGE-SERVICE] Файл {} успешно обработан, загружен и сохранен в БД", fileId);

            } catch (Exception e) {
                log.error(">>> [IMAGE-SERVICE] Ошибка обработки отдельного файла: ", e);
                throw new RuntimeException("Failed to process file", e);
            }
        }
        return responses;
    }
}