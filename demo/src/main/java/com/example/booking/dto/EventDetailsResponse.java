package com.example.booking.dto;

import java.time.LocalDateTime;
import java.util.List;

public record EventDetailsResponse(
        Long id,
        String title,
        String description,
        String venue,
        LocalDateTime dateTime,
        List<ZoneDetails> zones) {

    public record ZoneDetails(
            Long id,
            String zoneName,
            double price,
            int totalCapacity,
            int availableCapacity) {
    }
}