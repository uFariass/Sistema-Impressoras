package com.impressora.elgisa.repository;

import com.impressora.elgisa.model.Aba10;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface Aba10Repository extends JpaRepository<Aba10, Long> {
    Optional<Aba10> findByNumeroDeSerie(String numeroDeSerie);
    List<Aba10> findAllByNumeroDeSerie(String numeroDeSerie);
}
