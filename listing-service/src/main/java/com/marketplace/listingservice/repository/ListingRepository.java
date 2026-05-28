package com.marketplace.listingservice.repository;

import com.marketplace.listingservice.entity.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {
    // Спринг сам сгенерирует SQL-запрос удаления по имени метода!
    void deleteAllByOwnerId(Long ownerId);
}