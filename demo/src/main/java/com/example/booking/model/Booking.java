package com.example.booking.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Zone zone;

    private int ticketCount;

    private String status;

    // Add this annotation to ensure Hibernate maps it to the existing column correctly
    @Column(name = "total_price")
    private int totalPrice;
}