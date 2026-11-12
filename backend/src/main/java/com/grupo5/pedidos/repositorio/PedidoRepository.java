package com.grupo5.pedidos.repositorio;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.grupo5.pedidos.entidad.Pedido;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByIdUsuarioOrderByIdDesc(Long idUsuario);

    List<Pedido> findByIdUsuarioAndEstado(Long idUsuario, String estado);
}
