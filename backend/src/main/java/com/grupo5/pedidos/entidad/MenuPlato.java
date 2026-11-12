package com.grupo5.pedidos.entidad;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Tabla puente CON atributo propio (stock_disponible) → por eso es entidad.
 * "Este plato se ofrece este día, con estas porciones".
 * stockDisponible son las porciones OFRECIDAS: lo reservado no se resta acá, se cuenta
 * en pedido_dia (igual que el consolidado: lo que se puede contar no se guarda).
 */
@Entity
@Table(name = "menu_plato")
public class MenuPlato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_menu_plato")
    private Long id;

    @Column(nullable = false)
    private Long idMenuDia;

    @Column(nullable = false)
    private Long idPlato;

    @Column(nullable = false)
    private Integer stockDisponible;

    public MenuPlato() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIdMenuDia() { return idMenuDia; }
    public void setIdMenuDia(Long idMenuDia) { this.idMenuDia = idMenuDia; }

    public Long getIdPlato() { return idPlato; }
    public void setIdPlato(Long idPlato) { this.idPlato = idPlato; }

    public Integer getStockDisponible() { return stockDisponible; }
    public void setStockDisponible(Integer stockDisponible) { this.stockDisponible = stockDisponible; }
}
