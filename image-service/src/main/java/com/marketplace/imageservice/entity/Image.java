package com.marketplace.imageservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "images")
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileId; // Наш UUID, имя файла в MinIO (например, proc-abc-123.jpg)
    private String rawUrl;
    private String processedUrl;

    // Новое ключевое поле для связи с объявлениями!
    private Long listingId;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Геттеры, сеттеры и конструкторы
    public Long getId() { return id; }
    public String getFileId() { return fileId; }
    public void setFileId(String fileId) { this.fileId = fileId; }
    public String getRawUrl() { return rawUrl; }
    public void setRawUrl(String rawUrl) { this.rawUrl = rawUrl; }
    public String getProcessedUrl() { return processedUrl; }
    public void setProcessedUrl(String processedUrl) { this.processedUrl = processedUrl; }
    public Long getListingId() { return listingId; }
    public void setListingId(Long listingId) { this.listingId = listingId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}