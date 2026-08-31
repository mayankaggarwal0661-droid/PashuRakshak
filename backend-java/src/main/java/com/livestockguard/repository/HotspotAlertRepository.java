package com.livestockguard.repository;

import com.livestockguard.model.HotspotAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HotspotAlertRepository extends JpaRepository<HotspotAlert, Long> {

    List<HotspotAlert> findByActiveTrue();

    Optional<HotspotAlert> findByVillageAndActiveTrue(String village);
}
