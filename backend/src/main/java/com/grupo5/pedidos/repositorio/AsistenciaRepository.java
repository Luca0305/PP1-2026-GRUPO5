package com.grupo5.pedidos.repositorio;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.grupo5.pedidos.entidad.Asistencia;

/** La puerta a la tabla asistencia. */
public interface AsistenciaRepository extends JpaRepository<Asistencia, Long> {

    // Consulta derivada: Spring lee el nombre y arma
    // SELECT ... WHERE id_usuario = ? AND fecha BETWEEN ? AND ? ORDER BY fecha
    // (BETWEEN incluye los dos extremos).
    List<Asistencia> findByIdUsuarioAndFechaBetweenOrderByFechaAsc(
            Long idUsuario, LocalDate desde, LocalDate hasta);

    Optional<Asistencia> findByIdUsuarioAndFecha(Long idUsuario, LocalDate fecha);

    // Pedidos activos (BORRADOR o CONFIRMADO) del empleado para una fecha.
    // Es SQL nativo porque Pedido y PedidoDia todavía no son entidades (M4).
    // Sirve para la regla "no podés dejar de venir un día que ya pediste".
    @Query(value = """
            SELECT COUNT(*)
            FROM pedido_dia pd
            JOIN pedido pe ON pe.id_pedido = pd.id_pedido
            WHERE pe.id_usuario = :idUsuario
              AND pd.fecha_entrega = :fecha
              AND pe.estado <> 'CANCELADO'
            """, nativeQuery = true)
    long contarPedidosActivos(@Param("idUsuario") Long idUsuario,
                              @Param("fecha") LocalDate fecha);
}
