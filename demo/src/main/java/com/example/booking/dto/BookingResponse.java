package com.example.booking.dto;

import com.example.booking.model.Booking;

public record BookingResponse(
        Long id,
        Long eventId,
        String eventTitle,
        Long zoneId,
        String zoneName,
        int ticketCount,
        String status,
        int totalPrice) {

    public static BookingResponse from(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getZone().getEvent().getId(),
                booking.getZone().getEvent().getTitle(),
                booking.getZone().getId(),
                booking.getZone().getZoneName(),
                booking.getTicketCount(),
                booking.getStatus(),
                booking.getTotalPrice());
    }
}