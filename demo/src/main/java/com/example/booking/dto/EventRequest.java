package com.example.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record EventRequest(
        @NotBlank @Size(max = 150) String title,
        @Size(max = 5000) String description,
        @NotBlank @Size(max = 200) String venue,
        @NotNull LocalDateTime dateTime) {
}