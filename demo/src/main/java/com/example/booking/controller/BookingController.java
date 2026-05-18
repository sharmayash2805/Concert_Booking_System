package com.example.booking.controller;

import com.example.booking.dto.BookingRequest;
import com.example.booking.model.User;
import com.example.booking.repository.UserRepository;
import com.example.booking.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin
public class BookingController {

    @Autowired private BookingService bookingService;
    @Autowired private UserRepository userRepository;

    @PostMapping("/hold")
    public ResponseEntity<?> holdTickets(@RequestBody BookingRequest request) {
        try {
            User user = userRepository.findById(request.getUserId()).orElseThrow();
            return ResponseEntity.ok(bookingService.holdTickets(request.getZoneId(), request.getTicketCount(), user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/update-quantity/{bookingId}")
    public ResponseEntity<?> updateQuantity(@PathVariable Long bookingId, @RequestBody Map<String, Integer> body) {
        try {
            int newQuantity = body.get("quantity");
            return ResponseEntity.ok(bookingService.updateHoldQuantity(bookingId, newQuantity));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/confirm/{bookingId}")
    public ResponseEntity<?> confirm(@PathVariable Long bookingId) {
        bookingService.confirmBooking(bookingId);
        return ResponseEntity.ok("Confirmed");
    }

    @PostMapping("/cancel/{bookingId}")
    public ResponseEntity<?> cancel(@PathVariable Long bookingId) {
        bookingService.releaseTickets(bookingId);
        return ResponseEntity.ok("Cancelled");
    }
}