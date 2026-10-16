package com.example.booking.controller;

import com.example.booking.dto.EventDetailsResponse;
import com.example.booking.dto.EventRequest;
import com.example.booking.model.Event;
import com.example.booking.repository.ZoneRepository;
import com.example.booking.repository.EventRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventRepository eventRepository;
    private final ZoneRepository zoneRepository;

    public EventController(EventRepository eventRepository, ZoneRepository zoneRepository) {
        this.eventRepository = eventRepository;
        this.zoneRepository = zoneRepository;
    }

    @GetMapping
    public List<EventDetailsResponse> getEvents() {
        return eventRepository.findAll().stream().map(this::toResponse).toList();
    }

    @GetMapping("/{id}")
    public EventDetailsResponse getEvent(@PathVariable Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
        return toResponse(event);
    }

    @PostMapping
    public ResponseEntity<EventDetailsResponse> createEvent(@Valid @RequestBody EventRequest request) {
        Event event = new Event();
        applyRequest(event, request);
        Event created = eventRepository.save(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(created));
    }

    @PutMapping("/{id}")
    public EventDetailsResponse updateEvent(@PathVariable Long id, @Valid @RequestBody EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
        applyRequest(event, request);
        return toResponse(eventRepository.save(event));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        if (!eventRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found");
        }
        try {
            eventRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Event has related bookings or zones");
        }
    }

    private void applyRequest(Event event, EventRequest request) {
        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setVenue(request.venue());
        event.setDateTime(request.dateTime());
    }

    private EventDetailsResponse toResponse(Event event) {
        List<EventDetailsResponse.ZoneDetails> zones = zoneRepository.findAllByEvent_Id(event.getId())
                .stream()
                .map(zone -> new EventDetailsResponse.ZoneDetails(
                        zone.getId(), zone.getZoneName(), zone.getPrice(),
                        zone.getTotalCapacity(), zone.getAvailableCapacity()))
                .toList();

        return new EventDetailsResponse(
                event.getId(), event.getTitle(), event.getDescription(),
                event.getVenue(), event.getDateTime(), zones);
    }
}