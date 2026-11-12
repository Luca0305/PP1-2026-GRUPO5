package com.grupo5.pedidos.entidad;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Una fila de la tabla plato del script. Un objeto = una fila.
 * Los getters arman el JSON: un atributo sin getter no sale en la respuesta.
 */
@Entity
@Table(name = "plato")
public class Plato {

    // Regla 1 del modelo: la PK se llama id en Java y en el JSON,
    // aunque en la base sea id_plato.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_plato")
    private Long id;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(length = 300)
    private String descripcion;

    private String imagen;

    @Column(nullable = false, length = 60)
    private String categoria;

    // JPA usa este constructor vacío para crear un objeto por cada fila que lee.
    public Plato() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getImagen() { return imagen; }
    public void setImagen(String imagen) { this.imagen = imagen; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
}
