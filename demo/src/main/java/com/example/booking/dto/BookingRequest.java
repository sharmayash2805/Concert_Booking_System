package com.example.booking.dto;

import lombok.Data;

@Data
public class BookingRequest {
    private Long zoneId;
    private int ticketCount;
    private Long userId;
}