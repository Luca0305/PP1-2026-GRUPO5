package com.grupo5.pedidos.repositorio;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.grupo5.pedidos.entidad.MenuDia;

public interface MenuDiaRepository extends JpaRepository<MenuDia, Long> {

    // Mitad del cruce 1: "el menú publicado de un día". El empleado no ve borradores.
    List<MenuDia> findByFechaAndPublicadoTrue(LocalDate fecha);

    List<MenuDia> findByFechaBetweenAndPublicadoTrueOrderByFechaAsc(LocalDate desde, LocalDate hasta);

    // Administrar menús: también los no publicados (borradores).
    Optional<MenuDia> findByFecha(LocalDate fecha);

    List<MenuDia> findByFechaBetweenOrderByFechaAsc(LocalDate desde, LocalDate hasta);
}
