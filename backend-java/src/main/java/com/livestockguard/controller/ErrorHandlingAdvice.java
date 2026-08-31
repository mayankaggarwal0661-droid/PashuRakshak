package com.livestockguard.controller;

import com.livestockguard.service.CaseService;
import com.livestockguard.service.GooglePlacesService;
import com.livestockguard.service.ImageDiagnosisService;
import com.livestockguard.service.RiskAssessmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class ErrorHandlingAdvice {

    @ExceptionHandler(CaseService.NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(CaseService.NoSuchElementException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(RiskAssessmentService.RiskEngineException.class)
    public ResponseEntity<Map<String, String>> handleEngineFailure(RiskAssessmentService.RiskEngineException ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(GooglePlacesService.GooglePlacesException.class)
    public ResponseEntity<Map<String, String>> handlePlacesFailure(GooglePlacesService.GooglePlacesException ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(ImageDiagnosisService.ImageDiagnosisException.class)
    public ResponseEntity<Map<String, String>> handleImageDiagnosisFailure(ImageDiagnosisService.ImageDiagnosisException ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", ex.getMessage()));
    }
}
