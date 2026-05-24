package com.marketplace.listingservice.service;

import com.marketplace.listingservice.dto.CreateListingRequest;
import com.marketplace.listingservice.entity.Listing;
import com.marketplace.listingservice.repository.ListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingRepository listingRepository;

    public Listing createListing(CreateListingRequest request, Long ownerId) {
        Listing listing = Listing.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .ownerId(ownerId)
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .build();

        return listingRepository.save(listing);
    }
}