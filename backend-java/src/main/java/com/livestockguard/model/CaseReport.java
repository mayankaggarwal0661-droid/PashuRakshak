package com.livestockguard.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "case_reports")
public class CaseReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "animal_id")
    private Animal animal;

    @ElementCollection
    @CollectionTable(name = "case_symptoms", joinColumns = @JoinColumn(name = "case_id"))
    @Column(name = "symptom")
    private List<String> symptoms = new ArrayList<>();

    private Integer daysSinceOnset = 0;
    private Integer nearbyActiveCases = 0;
    private String photoUrl;
    private String village;
    private Double latitude;
    private Double longitude;

    // Filled in by the risk engine after assessment.
    private Double riskScore;

    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;

    @ElementCollection
    @CollectionTable(name = "case_flagged_symptoms", joinColumns = @JoinColumn(name = "case_id"))
    @Column(name = "symptom")
    private List<String> flaggedSymptoms = new ArrayList<>();

    @Column(length = 1000)
    private String recommendation;

    @Column(length = 2000)
    private String explanation;

    // Serialized JSON array of {name, matchPercent, note} — a differential
    // list, not a diagnosis. Stored as a string rather than a related table
    // since it's read-only output data, never queried or filtered on.
    @Column(length = 2000)
    private String possibleDiseasesJson;

    // Result of the optional photo-analysis step, already computed by the
    // frontend via /api/photo-analysis before this case was submitted —
    // stored verbatim, not recomputed here.
    @Column(length = 3000)
    private String photoAnalysisJson;

    // Populated automatically when no registered vet is nearby but Google
    // Places found a real clinic close to the case's location. This is a
    // suggestion, not a formal assignment (assignedVet stays null) since
    // it isn't a Vet record we manage.
    private String suggestedVetName;
    private String suggestedVetAddress;
    private String suggestedVetMapsUrl;

    @Enumerated(EnumType.STRING)
    private CaseStatus status = CaseStatus.REPORTED;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_vet_id")
    private Vet assignedVet;

    private Instant reportedAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Animal getAnimal() { return animal; }
    public void setAnimal(Animal animal) { this.animal = animal; }

    public List<String> getSymptoms() { return symptoms; }
    public void setSymptoms(List<String> symptoms) { this.symptoms = symptoms; }

    public Integer getDaysSinceOnset() { return daysSinceOnset; }
    public void setDaysSinceOnset(Integer daysSinceOnset) { this.daysSinceOnset = daysSinceOnset; }

    public Integer getNearbyActiveCases() { return nearbyActiveCases; }
    public void setNearbyActiveCases(Integer nearbyActiveCases) { this.nearbyActiveCases = nearbyActiveCases; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public String getVillage() { return village; }
    public void setVillage(String village) { this.village = village; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getRiskScore() { return riskScore; }
    public void setRiskScore(Double riskScore) { this.riskScore = riskScore; }

    public RiskLevel getRiskLevel() { return riskLevel; }
    public void setRiskLevel(RiskLevel riskLevel) { this.riskLevel = riskLevel; }

    public List<String> getFlaggedSymptoms() { return flaggedSymptoms; }
    public void setFlaggedSymptoms(List<String> flaggedSymptoms) { this.flaggedSymptoms = flaggedSymptoms; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getPossibleDiseasesJson() { return possibleDiseasesJson; }
    public void setPossibleDiseasesJson(String possibleDiseasesJson) { this.possibleDiseasesJson = possibleDiseasesJson; }

    public String getPhotoAnalysisJson() { return photoAnalysisJson; }
    public void setPhotoAnalysisJson(String photoAnalysisJson) { this.photoAnalysisJson = photoAnalysisJson; }

    public String getSuggestedVetName() { return suggestedVetName; }
    public void setSuggestedVetName(String suggestedVetName) { this.suggestedVetName = suggestedVetName; }

    public String getSuggestedVetAddress() { return suggestedVetAddress; }
    public void setSuggestedVetAddress(String suggestedVetAddress) { this.suggestedVetAddress = suggestedVetAddress; }

    public String getSuggestedVetMapsUrl() { return suggestedVetMapsUrl; }
    public void setSuggestedVetMapsUrl(String suggestedVetMapsUrl) { this.suggestedVetMapsUrl = suggestedVetMapsUrl; }

    public CaseStatus getStatus() { return status; }
    public void setStatus(CaseStatus status) { this.status = status; }

    public Vet getAssignedVet() { return assignedVet; }
    public void setAssignedVet(Vet assignedVet) { this.assignedVet = assignedVet; }

    public Instant getReportedAt() { return reportedAt; }
    public void setReportedAt(Instant reportedAt) { this.reportedAt = reportedAt; }
}
