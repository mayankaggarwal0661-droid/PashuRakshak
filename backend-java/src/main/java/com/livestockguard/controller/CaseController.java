package com.livestockguard.controller;

import com.livestockguard.dto.CaseReportRequest;
import com.livestockguard.model.CaseReport;
import com.livestockguard.model.CaseStatus;
import com.livestockguard.service.CaseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cases")
public class CaseController {

    private final CaseService caseService;

    public CaseController(CaseService caseService) {
        this.caseService = caseService;
    }

    @PostMapping
    public ResponseEntity<CaseReport> reportCase(@Valid @RequestBody CaseReportRequest request) {
        CaseReport created = caseService.reportCase(request);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public List<CaseReport> listCases() {
        return caseService.listCases();
    }

    @GetMapping("/{id}")
    public CaseReport getCase(@PathVariable Long id) {
        return caseService.getCase(id);
    }

    @PatchMapping("/{id}/status")
    public CaseReport updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        CaseStatus status = CaseStatus.valueOf(body.get("status").toUpperCase());
        return caseService.updateStatus(id, status);
    }

    @PostMapping("/{id}/assign")
    public CaseReport assignVet(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        return caseService.assignVet(id, body.get("vetId"));
    }
}
