package com.grupo5.pedidos.entidad;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Una fila de usuario. En M2 solo se usa para comprobar que quien guarda
 * su asistencia existe, está activo y es EMPLEADO. M1 (acceso) la reutiliza.
 * rol es VARCHAR(20) + CHECK en el script, por eso en Java es String.
 */
@Entity
@Table(name = "usuario")
public class Usuario {

    public static final String ROL_EMPLEADO = "EMPLEADO";
    public static final String ROL_ADMINISTRADOR = "ADMINISTRADOR";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long id;

    @Column(nullable = false, length = 60)
    private String nombre;

    @Column(nullable = false, length = 60)
    private String apellido;

    @Column(nullable = false, length = 120, unique = true)
    private String correo;

    // Nunca sale en el JSON: @JsonIgnore la saca de cualquier respuesta.
    @JsonIgnore
    @Column(nullable = false, length = 255)
    private String contrasena;

    @Column(length = 30)
    private String telefono;

    @Column(nullable = false, length = 20)
    private String rol;

    @Column(nullable = false)
    private Boolean activo;

    public Usuario() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getContrasena() { return contrasena; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}
