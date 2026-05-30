package com.marketplace.imageservice.repository;

import com.marketplace.imageservice.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {
    Optional<Image> findByFileId(String fileId);
    List<Image> findByListingId(Long listingId);
}