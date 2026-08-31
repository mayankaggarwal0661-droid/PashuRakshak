package com.livestockguard.repository;

import com.livestockguard.model.CaseReport;
import com.livestockguard.model.RiskLevel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface CaseReportRepository extends JpaRepository<CaseReport, Long> {

    List<CaseReport> findByVillageAndReportedAtAfter(String village, Instant after);

    List<CaseReport> findByVillageAndRiskLevelInAndReportedAtAfter(
            String village, List<RiskLevel> riskLevels, Instant after);

    List<CaseReport> findAllByOrderByReportedAtDesc();
}
