package com.grupo5.pedidos.repositorio;

import org.springframework.data.jpa.repository.JpaRepository;

import com.grupo5.pedidos.entidad.Plato;

/**
 * La puerta a la tabla plato. No se implementa: Spring escribe el código.
 * Ya trae findAll(), findById(...), save(...) y deleteById(...).
 */
public interface PlatoRepository extends JpaRepository<Plato, Long> {

    // Administrar menús: un plato escrito a mano se reutiliza si ya existe con ese nombre.
    java.util.Optional<Plato> findFirstByNombreIgnoreCase(String nombre);

    java.util.List<Plato> findAllByOrderByNombreAsc();
}
