package com.livestockguard.controller;

import com.livestockguard.model.Vet;
import com.livestockguard.repository.VetRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vets")
public class VetController {

    private final VetRepository vetRepository;

    public VetController(VetRepository vetRepository) {
        this.vetRepository = vetRepository;
    }

    @GetMapping
    public List<Vet> listVets() {
        return vetRepository.findAll();
    }

    @PostMapping
    public Vet createVet(@RequestBody Vet vet) {
        return vetRepository.save(vet);
    }
}
