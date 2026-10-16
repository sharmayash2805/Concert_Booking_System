package com.example.booking.controller;

import com.example.booking.dto.BookingRequest;
import com.example.booking.dto.BookingResponse;
import com.example.booking.dto.UpdateQuantityRequest;
import com.example.booking.model.User;
import com.example.booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/me")
    public java.util.List<BookingResponse> myBookings(@AuthenticationPrincipal User user) {
        return bookingService.getBookingsForUser(user);
    }

    @PostMapping("/hold")
    public ResponseEntity<BookingResponse> holdTickets(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.holdTickets(request.getZoneId(), request.getTicketCount(), user));
    }

    @PostMapping("/update-quantity/{bookingId}")
    public ResponseEntity<BookingResponse> updateQuantity(
            @PathVariable Long bookingId,
            @Valid @RequestBody UpdateQuantityRequest body,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.updateHoldQuantity(bookingId, body.quantity(), user));
    }

    @PostMapping("/confirm/{bookingId}")
    public ResponseEntity<?> confirm(@PathVariable Long bookingId, @AuthenticationPrincipal User user) {
        bookingService.confirmBooking(bookingId, user);
        return ResponseEntity.ok("Confirmed");
    }

    @PostMapping("/cancel/{bookingId}")
    public ResponseEntity<?> cancel(@PathVariable Long bookingId, @AuthenticationPrincipal User user) {
        bookingService.releaseTickets(bookingId, user);
        return ResponseEntity.ok("Cancelled");
    }
}