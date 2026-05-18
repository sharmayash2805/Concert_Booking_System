package com.example.booking.repository;

import com.example.booking.model.Zone;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import java.util.Optional;

public interface ZoneRepository extends JpaRepository<Zone, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Zone> findById(Long id);
}