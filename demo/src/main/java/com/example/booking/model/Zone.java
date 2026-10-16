package com.example.booking.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Zone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String zoneName; // LEFT, RIGHT, FRONT, AWAY
    private double price;
    private int totalCapacity;
    private int availableCapacity;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;
}