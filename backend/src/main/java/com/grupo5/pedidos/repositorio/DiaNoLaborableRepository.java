package com.grupo5.pedidos.repositorio;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.grupo5.pedidos.entidad.DiaNoLaborable;

public interface DiaNoLaborableRepository extends JpaRepository<DiaNoLaborable, Long> {

    List<DiaNoLaborable> findAllByOrderByFechaAsc();

    boolean existsByFecha(LocalDate fecha);

    Optional<DiaNoLaborable> findByFecha(LocalDate fecha);

    List<DiaNoLaborable> findByFechaBetweenOrderByFechaAsc(LocalDate desde, LocalDate hasta);
}
