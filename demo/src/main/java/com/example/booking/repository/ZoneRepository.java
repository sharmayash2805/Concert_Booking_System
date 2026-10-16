package com.example.booking.repository;

import com.example.booking.model.Zone;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ZoneRepository extends JpaRepository<Zone, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select zone from Zone zone where zone.id = :id")
    Optional<Zone> findByIdForUpdate(@Param("id") Long id);

    List<Zone> findAllByEvent_Id(Long eventId);
}