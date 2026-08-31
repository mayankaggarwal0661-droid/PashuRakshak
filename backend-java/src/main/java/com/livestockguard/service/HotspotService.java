package com.livestockguard.service;

import com.livestockguard.model.HotspotAlert;
import com.livestockguard.model.RiskLevel;
import com.livestockguard.repository.CaseReportRepository;
import com.livestockguard.repository.HotspotAlertRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Watches for clusters of HIGH/CRITICAL cases in the same village within a
 * rolling window and raises (or clears) a village-level hotspot alert.
 * This is the "aggregate cases -> detect hotspot -> send early warning"
 * step from the problem statement's flowchart.
 */
@Service
public class HotspotService {

    private final CaseReportRepository caseReportRepository;
    private final HotspotAlertRepository hotspotAlertRepository;
    private final int windowDays;
    private final int triggerCount;

    public HotspotService(CaseReportRepository caseReportRepository,
                           HotspotAlertRepository hotspotAlertRepository,
                           @Value("${livestockguard.hotspot.window-days}") int windowDays,
                           @Value("${livestockguard.hotspot.trigger-count}") int triggerCount) {
        this.caseReportRepository = caseReportRepository;
        this.hotspotAlertRepository = hotspotAlertRepository;
        this.windowDays = windowDays;
        this.triggerCount = triggerCount;
    }

    @Transactional
    public void reevaluateVillage(String village) {
        Instant windowStart = Instant.now().minus(windowDays, ChronoUnit.DAYS);
        int severeCount = caseReportRepository
                .findByVillageAndRiskLevelInAndReportedAtAfter(
                        village, List.of(RiskLevel.HIGH, RiskLevel.CRITICAL), windowStart)
                .size();

        var existing = hotspotAlertRepository.findByVillageAndActiveTrue(village);

        if (severeCount >= triggerCount) {
            HotspotAlert alert = existing.orElseGet(HotspotAlert::new);
            alert.setVillage(village);
            alert.setActiveCaseCount(severeCount);
            alert.setActive(true);
            if (alert.getId() == null) alert.setTriggeredAt(Instant.now());
            hotspotAlertRepository.save(alert);
        } else {
            existing.ifPresent(alert -> {
                alert.setActive(false);
                hotspotAlertRepository.save(alert);
            });
        }
    }

    public List<HotspotAlert> listActiveHotspots() {
        return hotspotAlertRepository.findByActiveTrue();
    }
}
