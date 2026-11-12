package com.grupo5.pedidos.repositorio;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.grupo5.pedidos.entidad.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // La va a usar M1 (login por correo).
    Optional<Usuario> findByCorreoIgnoreCase(String correo);

    List<Usuario> findByRolAndActivoTrueOrderByApellidoAscNombreAsc(String rol);

    List<Usuario> findAllByOrderByApellidoAscNombreAsc();
}
