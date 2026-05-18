package com.example.booking.service;

import com.example.booking.model.*;
import com.example.booking.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {

    @Autowired private ZoneRepository zoneRepository;
    @Autowired private BookingRepository bookingRepository;

    @Transactional
    public Booking holdTickets(Long zoneId, int ticketCount, User user) {
        Zone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new RuntimeException("Zone not found"));

        if (zone.getAvailableCapacity() < ticketCount) {
            throw new RuntimeException("No tickets available");
        }

        zone.setAvailableCapacity(zone.getAvailableCapacity() - ticketCount);
        zoneRepository.save(zone);

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setZone(zone);
        booking.setTicketCount(ticketCount);
        booking.setStatus("PENDING");
        booking.setTotalPrice((int)(zone.getPrice() * ticketCount));

        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking updateHoldQuantity(Long bookingId, int newQuantity) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Zone zone = booking.getZone();
        int currentQuantity = booking.getTicketCount();
        int diff = newQuantity - currentQuantity;

        // Check availability if increasing quantity
        if (diff > 0 && zone.getAvailableCapacity() < diff) {
            throw new RuntimeException("Not enough capacity");
        }

        // Adjust capacity
        zone.setAvailableCapacity(zone.getAvailableCapacity() - diff);
        zoneRepository.save(zone);

        // Update booking
        booking.setTicketCount(newQuantity);
        booking.setTotalPrice((int) (zone.getPrice() * newQuantity));
        return bookingRepository.save(booking);
    }

    @Transactional
    public void confirmBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        booking.setStatus("CONFIRMED");
        bookingRepository.save(booking);
    }

    @Transactional
    public void releaseTickets(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        Zone zone = booking.getZone();
        zone.setAvailableCapacity(zone.getAvailableCapacity() + booking.getTicketCount());
        zoneRepository.save(zone);
        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);
    }
}