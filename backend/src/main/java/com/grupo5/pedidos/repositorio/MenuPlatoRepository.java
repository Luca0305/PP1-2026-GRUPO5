package com.grupo5.pedidos.repositorio;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.grupo5.pedidos.entidad.MenuPlato;

public interface MenuPlatoRepository extends JpaRepository<MenuPlato, Long> {

    // La otra mitad del cruce 1: las opciones de esos menús, en el orden en que se cargaron.
    List<MenuPlato> findByIdMenuDiaInOrderByIdAsc(Collection<Long> idsMenuDia);

    List<MenuPlato> findByIdMenuDiaOrderByIdAsc(Long idMenuDia);

    // ¿Este plato se ofrece en este menú? (regla de M4)
    Optional<MenuPlato> findByIdMenuDiaAndIdPlato(Long idMenuDia, Long idPlato);
}
