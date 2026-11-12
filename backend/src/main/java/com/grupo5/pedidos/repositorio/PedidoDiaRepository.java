package com.grupo5.pedidos.repositorio;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.grupo5.pedidos.entidad.PedidoDia;
import com.grupo5.pedidos.servicio.ConsolidadoFila;
import com.grupo5.pedidos.servicio.PedidoDetalle;

/**
 * Las consultas que cruzan pedido_dia con pedido / plato / usuario están escritas en
 * JPQL (sobre las ENTIDADES, no sobre las tablas). Como las FK son Long y no hay
 * @ManyToOne, el JOIN se escribe "a mano" en el WHERE: pe.id = pd.idPedido.
 */
public interface PedidoDiaRepository extends JpaRepository<PedidoDia, Long> {

    List<PedidoDia> findByIdPedidoInOrderByFechaEntregaAsc(Collection<Long> idsPedido);

    List<PedidoDia> findByIdPedidoOrderByFechaEntregaAsc(Long idPedido);

    long countByIdPedido(Long idPedido);

    // ¿Alguna línea (aunque sea de un pedido cancelado) apunta a este menú? Entonces no se puede borrar (FK).
    long countByIdMenuDia(Long idMenuDia);

    // Porciones ya reservadas de una opción: cuentan las líneas de pedidos BORRADOR
    // y CONFIRMADO (un borrador también reserva, como en el frontend).
    // :excluir permite no contarse a sí misma al modificar una línea.
    @Query("""
            SELECT COUNT(pd) FROM PedidoDia pd, Pedido pe
            WHERE pe.id = pd.idPedido
              AND pd.idMenuDia = :idMenuDia
              AND pd.idPlato = :idPlato
              AND pe.estado <> 'CANCELADO'
              AND pd.id <> :excluir
            """)
    long contarReservadas(@Param("idMenuDia") Long idMenuDia,
                          @Param("idPlato") Long idPlato,
                          @Param("excluir") Long excluir);

    // ¿Hay pedidos activos (no cancelados) para esa fecha? Lo usan Días sin servicio y Menús.
    @Query("""
            SELECT COUNT(pd) FROM PedidoDia pd, Pedido pe
            WHERE pe.id = pd.idPedido
              AND pd.fechaEntrega = :fecha
              AND pe.estado <> 'CANCELADO'
            """)
    long contarActivasDelDia(@Param("fecha") LocalDate fecha);

    // La línea activa (no cancelada) de un empleado para una fecha: hay como mucho una.
    @Query("""
            SELECT pd FROM PedidoDia pd, Pedido pe
            WHERE pe.id = pd.idPedido
              AND pe.idUsuario = :idUsuario
              AND pd.fechaEntrega = :fecha
              AND pe.estado <> 'CANCELADO'
            """)
    List<PedidoDia> buscarActivas(@Param("idUsuario") Long idUsuario,
                                  @Param("fecha") LocalDate fecha);

    // CRUCE 2 · el consolidado: COUNT(*) ... GROUP BY sobre pedido_dia, solo CONFIRMADO.
    @Query("""
            SELECT new com.grupo5.pedidos.servicio.ConsolidadoFila(
                       pd.fechaEntrega, p.id, p.nombre, COUNT(pd))
            FROM PedidoDia pd, Pedido pe, Plato p
            WHERE pe.id = pd.idPedido
              AND p.id = pd.idPlato
              AND pe.estado = 'CONFIRMADO'
              AND pd.fechaEntrega BETWEEN :desde AND :hasta
            GROUP BY pd.fechaEntrega, p.id, p.nombre
            ORDER BY pd.fechaEntrega, COUNT(pd) DESC, p.nombre
            """)
    List<ConsolidadoFila> consolidar(@Param("desde") LocalDate desde,
                                     @Param("hasta") LocalDate hasta);

    // Detalle para el administrador: cada línea no cancelada, con quién la pidió.
    @Query("""
            SELECT new com.grupo5.pedidos.servicio.PedidoDetalle(
                       pd.fechaEntrega, pd.idPlato, CONCAT(u.nombre, ' ', u.apellido),
                       p.nombre, pe.estado, pd.comentario)
            FROM PedidoDia pd, Pedido pe, Plato p, Usuario u
            WHERE pe.id = pd.idPedido
              AND p.id = pd.idPlato
              AND u.id = pe.idUsuario
              AND pe.estado <> 'CANCELADO'
              AND pd.fechaEntrega BETWEEN :desde AND :hasta
            ORDER BY pd.fechaEntrega, u.apellido, u.nombre
            """)
    List<PedidoDetalle> detallar(@Param("desde") LocalDate desde,
                                 @Param("hasta") LocalDate hasta);
}
