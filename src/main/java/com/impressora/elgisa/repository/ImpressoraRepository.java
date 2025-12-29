package com.impressora.elgisa.repository;

import com.impressora.elgisa.model.Impressora;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface ImpressoraRepository extends JpaRepository<Impressora, Long> {
    Optional<Impressora> findByNumeroSerie(String numeroSerie);
    List<Impressora> findAllByNumeroSerie(String numeroSerie);
    
    @org.springframework.data.jpa.repository.Query("SELECT i FROM Impressora i WHERE i.numeroSerie LIKE %?1% OR i.nomeItem LIKE %?1%")
    org.springframework.data.domain.Page<Impressora> findByNumeroSerieContainingOrNomeItemContaining(
        String termo, org.springframework.data.domain.Pageable pageable);
    
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Impressora i WHERE i.id IN ?1")
    void deleteByIdIn(List<Long> ids);
}
