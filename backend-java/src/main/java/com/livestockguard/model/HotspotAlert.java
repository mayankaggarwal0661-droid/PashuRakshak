package com.livestockguard.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "hotspot_alerts")
public class HotspotAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String village;
    private Integer activeCaseCount;
    private Instant triggeredAt = Instant.now();
    private Boolean active = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getVillage() { return village; }
    public void setVillage(String village) { this.village = village; }

    public Integer getActiveCaseCount() { return activeCaseCount; }
    public void setActiveCaseCount(Integer activeCaseCount) { this.activeCaseCount = activeCaseCount; }

    public Instant getTriggeredAt() { return triggeredAt; }
    public void setTriggeredAt(Instant triggeredAt) { this.triggeredAt = triggeredAt; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
