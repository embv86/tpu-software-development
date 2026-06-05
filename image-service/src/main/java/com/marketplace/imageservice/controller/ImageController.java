package com.marketplace.imageservice.controller;

import com.marketplace.imageservice.dto.ImageResponse;
import com.marketplace.imageservice.service.ImageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/images")
public class ImageController {

    private final ImageService imageService;

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<List<ImageResponse>> uploadImages(@RequestParam("files") List<MultipartFile> files) {
        if (files.size() > 10) {
            throw new IllegalArgumentException("You cannot upload more than 10 images at once");
        }

        List<ImageResponse> responses = imageService.processAndUploadMultiple(files);
        return ResponseEntity.ok(responses);
    }
}