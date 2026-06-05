package com.marketplace.listingservice.repository;

import com.marketplace.listingservice.entity.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ListingRepository extends JpaRepository<Listing, Long> {
    List<Listing> findAllByOwnerId(Long ownerId);

    void deleteAllByOwnerId(Long ownerId);
}