package com.livestockguard.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "animals")
public class Animal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String species;      // cattle, buffalo, goat, sheep, poultry, pig
    private String breed;
    private Integer ageMonths;
    private String ownerName;
    private String ownerPhone;
    private String village;
    private Boolean vaccinated = false;
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSpecies() { return species; }
    public void setSpecies(String species) { this.species = species; }

    public String getBreed() { return breed; }
    public void setBreed(String breed) { this.breed = breed; }

    public Integer getAgeMonths() { return ageMonths; }
    public void setAgeMonths(Integer ageMonths) { this.ageMonths = ageMonths; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getOwnerPhone() { return ownerPhone; }
    public void setOwnerPhone(String ownerPhone) { this.ownerPhone = ownerPhone; }

    public String getVillage() { return village; }
    public void setVillage(String village) { this.village = village; }

    public Boolean getVaccinated() { return vaccinated; }
    public void setVaccinated(Boolean vaccinated) { this.vaccinated = vaccinated; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
