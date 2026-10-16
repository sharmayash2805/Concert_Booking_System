package com.example.booking.service;

import com.example.booking.model.*;
import com.example.booking.repository.*;
import com.example.booking.dto.BookingResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BookingService {

    private final ZoneRepository zoneRepository;
    private final BookingRepository bookingRepository;

    public BookingService(ZoneRepository zoneRepository, BookingRepository bookingRepository) {
        this.zoneRepository = zoneRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public BookingResponse holdTickets(Long zoneId, int ticketCount, User user) {
        Zone zone = zoneRepository.findByIdForUpdate(zoneId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Zone not found"));

        if (ticketCount < 1 || ticketCount > 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ticket count must be between 1 and 6");
        }

        if (zone.getAvailableCapacity() < ticketCount) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No tickets available");
        }

        zone.setAvailableCapacity(zone.getAvailableCapacity() - ticketCount);
        zoneRepository.save(zone);

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setZone(zone);
        booking.setTicketCount(ticketCount);
        booking.setStatus("PENDING");
        booking.setTotalPrice((int)(zone.getPrice() * ticketCount));

        return BookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse updateHoldQuantity(Long bookingId, int newQuantity, User user) {
        Booking booking = bookingRepository.findByIdForUpdate(bookingId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        verifyOwnership(booking, user);
        if (newQuantity < 1 || newQuantity > 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be between 1 and 6");
        }

        Zone zone = zoneRepository.findByIdForUpdate(booking.getZone().getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Zone not found"));
        int currentQuantity = booking.getTicketCount();
        int diff = newQuantity - currentQuantity;

        // Check availability if increasing quantity
        if (diff > 0 && zone.getAvailableCapacity() < diff) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Not enough capacity");
        }

        // Adjust capacity
        zone.setAvailableCapacity(zone.getAvailableCapacity() - diff);
        zoneRepository.save(zone);

        // Update booking
        booking.setTicketCount(newQuantity);
        booking.setTotalPrice((int) (zone.getPrice() * newQuantity));
        return BookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional
    public void confirmBooking(Long bookingId, User user) {
        Booking booking = bookingRepository.findByIdForUpdate(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        verifyOwnership(booking, user);
        booking.setStatus("CONFIRMED");
        bookingRepository.save(booking);
    }

    @Transactional
    public void releaseTickets(Long bookingId, User user) {
        Booking booking = bookingRepository.findByIdForUpdate(bookingId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        verifyOwnership(booking, user);
        Zone zone = zoneRepository.findByIdForUpdate(booking.getZone().getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Zone not found"));
        zone.setAvailableCapacity(zone.getAvailableCapacity() + booking.getTicketCount());
        zoneRepository.save(zone);
        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);
    }

    @Transactional(readOnly = true)
    public java.util.List<BookingResponse> getBookingsForUser(User user) {
        return bookingRepository.findAllByUser_IdOrderByIdDesc(user.getId())
                .stream()
                .map(BookingResponse::from)
                .toList();
    }

    private Booking findOwnedBooking(Long bookingId, User user) {
        Booking booking = bookingRepository.findByIdForUpdate(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        verifyOwnership(booking, user);
        return booking;
    }

    private void verifyOwnership(Booking booking, User user) {
        if (!"ADMIN".equals(user.getRole()) && !booking.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Booking access denied");
        }
    }
}