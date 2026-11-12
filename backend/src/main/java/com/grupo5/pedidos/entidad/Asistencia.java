package com.grupo5.pedidos.entidad;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Una fila de la tabla asistencia: "el empleado X, el día Y, viene o no viene".
 * Es una entidad propia y no un campo de Usuario (la trampa ASISTENCIA del modelo):
 * con una fila por fecha se puede decir "el 27/10 sí, el 28/10 no".
 *
 * CREATE TABLE asistencia (
 *   id_asistencia BIGINT, id_usuario BIGINT, fecha DATE, asiste BOOLEAN,
 *   UNIQUE (id_usuario, fecha), FK id_usuario → usuario )
 */
@Entity
@Table(name = "asistencia",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_asistencia_usuario_fecha",
                columnNames = { "id_usuario", "fecha" }))
public class Asistencia {

    // Regla 1: la PK se llama id en Java y en el JSON, aunque en la base sea id_asistencia.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asistencia")
    private Long id;

    // Regla 2: la FK va en camelCase (id_usuario → idUsuario), como Long y sin
    // @ManyToOne, así el JSON queda plano: "idUsuario": 3.
    @Column(nullable = false)
    private Long idUsuario;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false)
    private Boolean asiste;

    // JPA usa este constructor vacío para crear un objeto por cada fila que lee.
    public Asistencia() {
    }

    public Asistencia(Long idUsuario, LocalDate fecha, Boolean asiste) {
        this.idUsuario = idUsuario;
        this.fecha = fecha;
        this.asiste = asiste;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public Boolean getAsiste() { return asiste; }
    public void setAsiste(Boolean asiste) { this.asiste = asiste; }
}
