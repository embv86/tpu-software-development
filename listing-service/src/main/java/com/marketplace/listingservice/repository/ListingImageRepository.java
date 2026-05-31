package com.marketplace.listingservice.repository;

import com.marketplace.listingservice.entity.ListingImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListingImageRepository extends JpaRepository<ListingImage, String> {
    // Ищет все картинки, у которых listing_id равен переданному значению
    List<ListingImage> findAllByListingId(Long listingId);
}