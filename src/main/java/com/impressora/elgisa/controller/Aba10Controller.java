package com.impressora.elgisa.controller;

import com.impressora.elgisa.model.Aba10;
import com.impressora.elgisa.repository.Aba10Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/aba10")
@CrossOrigin(origins = "*")
public class Aba10Controller {

    @Autowired
    private Aba10Repository repository;

    @GetMapping
    public List<Aba10> listarTodas() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Aba10> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Aba10 criar(@RequestBody Aba10 aba10) {
        return repository.save(aba10);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Aba10> atualizar(@PathVariable Long id, @RequestBody Aba10 aba10Atualizada) {
        return repository.findById(id)
                .map(aba10 -> {
                    aba10.setNfSimpress1(aba10Atualizada.getNfSimpress1());
                    aba10.setNumeroDeSerie(aba10Atualizada.getNumeroDeSerie());
                    aba10.setNfSimpress2(aba10Atualizada.getNfSimpress2());
                    aba10.setLote(aba10Atualizada.getLote());
                    aba10.setSemPecas(aba10Atualizada.getSemPecas());
                    return ResponseEntity.ok(repository.save(aba10));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
