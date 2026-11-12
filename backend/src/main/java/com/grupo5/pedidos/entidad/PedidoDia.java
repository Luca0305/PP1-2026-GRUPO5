package com.grupo5.pedidos.entidad;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * La línea del pedido: qué eligió el empleado para UN día, con su comentario.
 * Tabla puente CON atributos (fecha_entrega, comentario) → entidad.
 * UNIQUE (id_pedido, id_menu_dia): una sola opción por día dentro del mismo pedido.
 */
@Entity
@Table(name = "pedido_dia")
public class PedidoDia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido_dia")
    private Long id;

    @Column(nullable = false)
    private Long idPedido;

    @Column(nullable = false)
    private Long idMenuDia;

    @Column(nullable = false)
    private Long idPlato;

    @Column(nullable = false)
    private LocalDate fechaEntrega;

    @Column(length = 200)
    private String comentario;

    public PedidoDia() {
    }

    public PedidoDia(Long idPedido, Long idMenuDia, Long idPlato, LocalDate fechaEntrega, String comentario) {
        this.idPedido = idPedido;
        this.idMenuDia = idMenuDia;
        this.idPlato = idPlato;
        this.fechaEntrega = fechaEntrega;
        this.comentario = comentario;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIdPedido() { return idPedido; }
    public void setIdPedido(Long idPedido) { this.idPedido = idPedido; }

    public Long getIdMenuDia() { return idMenuDia; }
    public void setIdMenuDia(Long idMenuDia) { this.idMenuDia = idMenuDia; }

    public Long getIdPlato() { return idPlato; }
    public void setIdPlato(Long idPlato) { this.idPlato = idPlato; }

    public LocalDate getFechaEntrega() { return fechaEntrega; }
    public void setFechaEntrega(LocalDate fechaEntrega) { this.fechaEntrega = fechaEntrega; }

    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }
}
