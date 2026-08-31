package com.livestockguard.controller;

import com.livestockguard.dto.ImageAnalysisRequest;
import com.livestockguard.service.ImageDiagnosisService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/photo-analysis")
public class PhotoAnalysisController {

    private final ImageDiagnosisService imageDiagnosisService;

    public PhotoAnalysisController(ImageDiagnosisService imageDiagnosisService) {
        this.imageDiagnosisService = imageDiagnosisService;
    }

    @PostMapping
    public Map<String, Object> analyze(@Valid @RequestBody ImageAnalysisRequest request) {
        if (!imageDiagnosisService.isConfigured()) {
            return Map.of("configured", false);
        }
        Map<String, Object> result = imageDiagnosisService.analyze(request);
        result.put("configured", true);
        return result;
    }
}
