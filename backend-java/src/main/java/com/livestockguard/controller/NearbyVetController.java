package com.livestockguard.controller;

import com.livestockguard.dto.NearbyVet;
import com.livestockguard.service.GooglePlacesService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vets/nearby")
public class NearbyVetController {

    private final GooglePlacesService googlePlacesService;

    public NearbyVetController(GooglePlacesService googlePlacesService) {
        this.googlePlacesService = googlePlacesService;
    }

    @GetMapping
    public Map<String, Object> nearby(@RequestParam double lat, @RequestParam double lng) {
        if (!googlePlacesService.isConfigured()) {
            return Map.of("configured", false, "vets", List.of());
        }
        List<NearbyVet> vets = googlePlacesService.findNearbyVets(lat, lng);
        return Map.of("configured", true, "vets", vets);
    }
}
