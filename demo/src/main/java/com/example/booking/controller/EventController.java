package com.example.booking.controller;

import com.example.booking.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@CrossOrigin
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @DeleteMapping("/{id}")
    public String deleteEvent(@PathVariable Long id) {
        System.out.println("🔥 DELETE EVENT HIT: " + id);
        eventRepository.deleteById(id);
        return "Event deleted successfully";
    }
}