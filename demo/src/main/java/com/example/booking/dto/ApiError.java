package com.example.booking.dto;

public record ApiError(int status, String code, String message) {
}