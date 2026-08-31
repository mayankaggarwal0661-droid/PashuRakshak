package com.livestockguard.controller;

import com.livestockguard.model.HotspotAlert;
import com.livestockguard.service.HotspotService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/hotspots")
public class HotspotController {

    private final HotspotService hotspotService;

    public HotspotController(HotspotService hotspotService) {
        this.hotspotService = hotspotService;
    }

    @GetMapping
    public List<HotspotAlert> listActiveHotspots() {
        return hotspotService.listActiveHotspots();
    }
}
