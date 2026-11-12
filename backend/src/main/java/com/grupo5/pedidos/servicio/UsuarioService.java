package com.grupo5.pedidos.servicio;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grupo5.pedidos.entidad.Usuario;
import com.grupo5.pedidos.repositorio.UsuarioRepository;

/**
 * M1 · Acceso, Mi perfil y la administración de Usuarios, todo contra la tabla usuario.
 *
 * Cuenta PENDIENTE: el administrador "autoriza" un email y un rol (pantalla Usuarios) y la
 * cuenta queda creada SIN contraseña (contrasena = ''). La persona la completa desde
 * Registrate eligiendo su contraseña, igual que en el prototipo.
 *
 * Administradores autorizados: los emails de pedidos.administradores-autorizados
 * (application.properties) se registran como ADMINISTRADOR. Antes estaban en
 * frontend/data/empresa.json; ahora los decide el servidor.
 */
@Service
public class UsuarioService {

    /** La misma política de contraseña que el registro (RegistroRequest) y el frontend. */
    public static final String POLITICA_CONTRASENA = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9\\s])\\S{8,64}$";
    private static final String NOMBRE = "^[\\p{L}]+([ '\\-][\\p{L}]+)*$";
    static final String SIN_CONTRASENA = "";

    private final UsuarioRepository usuarioRepository;
    private final ContrasenaService contrasenaService;
    private final Set<String> administradoresAutorizados;

    public UsuarioService(UsuarioRepository usuarioRepository, ContrasenaService contrasenaService,
            @Value("${pedidos.administradores-autorizados:}") String administradoresAutorizados) {
        this.usuarioRepository = usuarioRepository;
        this.contrasenaService = contrasenaService;
        this.administradoresAutorizados = Arrays.stream(administradoresAutorizados.split(","))
                .map(String::trim).map(String::toLowerCase).filter(s -> !s.isEmpty())
                .collect(Collectors.toUnmodifiableSet());
    }

    static boolean pendiente(Usuario u) {
        return u.getContrasena() == null || u.getContrasena().isEmpty();
    }

    // ------------------------------------------------------------------ M1 · acceso

    @Transactional
    public UsuarioRespuesta registrar(String nombre, String apellido, String correo,
                                      String contrasena, String telefono) {
        String correoNormalizado = correo.trim().toLowerCase();
        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(correoNormalizado).orElse(null);
        if (usuario != null && !pendiente(usuario)) {
            throw new ReglaNegocioException("Este correo ya está registrado. Iniciá sesión con esa cuenta.");
        }
        if (usuario != null && !Boolean.TRUE.equals(usuario.getActivo())) {
            throw new ReglaNegocioException("La autorización de esta cuenta está desactivada. Consultá al administrador.");
        }
        if (usuario == null) {
            // Cuenta nueva: empleado, salvo que el email esté entre los administradores autorizados.
            usuario = new Usuario();
            usuario.setCorreo(correoNormalizado);
            usuario.setRol(administradoresAutorizados.contains(correoNormalizado)
                    ? Usuario.ROL_ADMINISTRADOR : Usuario.ROL_EMPLEADO);
            usuario.setActivo(true);
        }
        // Si estaba pendiente, se completa respetando el rol que eligió el administrador.
        usuario.setNombre(nombre.trim());
        usuario.setApellido(apellido.trim());
        usuario.setContrasena(contrasenaService.huella(contrasena));
        usuario.setTelefono(telefono == null || telefono.isBlank() ? null : telefono.trim());
        return UsuarioRespuesta.de(usuarioRepository.save(usuario));
    }

    @Transactional(readOnly = true)
    public UsuarioRespuesta ingresar(String correo, String contrasena) {
        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(correo.trim()).orElse(null);
        if (usuario != null && pendiente(usuario) && Boolean.TRUE.equals(usuario.getActivo())) {
            throw new AccesoDenegadoException(
                    "Tu cuenta está autorizada pero falta completar el registro: elegí Registrate.");
        }
        if (usuario == null || !contrasenaService.coincide(contrasena, usuario.getContrasena())) {
            // Mismo mensaje si no existe el correo o si la clave no coincide.
            throw new AccesoDenegadoException("Correo o contraseña incorrectos.");
        }
        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new AccesoDenegadoException("Tu cuenta está desactivada. Consultá al administrador.");
        }
        return UsuarioRespuesta.de(usuario);
    }

    // ------------------------------------------------------------------ Mi perfil

    /**
     * El usuario actualiza sus datos. Para cambiar la contraseña tiene que escribir la actual.
     * Los campos de contraseña vacíos = conservar la contraseña.
     */
    @Transactional
    public UsuarioRespuesta actualizarPerfil(Long idUsuario, String nombre, String apellido, String correo,
                                             String telefono, String contrasenaActual, String contrasenaNueva) {
        Usuario usuario = buscar(idUsuario);
        if (!Boolean.TRUE.equals(usuario.getActivo()) || pendiente(usuario)) {
            throw new AccesoDenegadoException("Tu cuenta no está activa. Volvé a iniciar sesión.");
        }
        validarNombre("Nombre", nombre);
        validarNombre("Apellido", apellido);
        String correoNormalizado = correo.trim().toLowerCase();
        usuarioRepository.findByCorreoIgnoreCase(correoNormalizado)
                .filter(otro -> !otro.getId().equals(idUsuario))
                .ifPresent(otro -> {
                    throw new ReglaNegocioException("Ya existe una cuenta con ese correo.");
                });
        boolean cambiaClave = contrasenaNueva != null && !contrasenaNueva.isEmpty();
        if (cambiaClave) {
            if (contrasenaActual == null || !contrasenaService.coincide(contrasenaActual, usuario.getContrasena())) {
                throw new ReglaNegocioException("La contraseña actual es incorrecta. Revisala antes de cambiarla.");
            }
            if (!contrasenaNueva.matches(POLITICA_CONTRASENA)) {
                throw new ReglaNegocioException(
                        "La contraseña nueva necesita 8 a 64 caracteres, mayúscula, minúscula, número y símbolo, sin espacios.");
            }
            usuario.setContrasena(contrasenaService.huella(contrasenaNueva));
        }
        usuario.setNombre(nombre.trim());
        usuario.setApellido(apellido.trim());
        usuario.setCorreo(correoNormalizado);
        usuario.setTelefono(telefono == null || telefono.isBlank() ? null : telefono.trim());
        return UsuarioRespuesta.de(usuarioRepository.save(usuario));
    }

    // ------------------------------------------------------------------ Usuarios (administrador)

    @Transactional(readOnly = true)
    public List<UsuarioRespuesta> listar(Long idAdministrador) {
        buscarAdministrador(idAdministrador);
        return usuarioRepository.findAllByOrderByApellidoAscNombreAsc().stream().map(UsuarioRespuesta::de).toList();
    }

    /** Autoriza un email con un rol: la cuenta queda pendiente hasta que la persona se registre. */
    @Transactional
    public UsuarioRespuesta autorizar(Long idAdministrador, String nombre, String apellido, String correo, String rol) {
        buscarAdministrador(idAdministrador);
        validarNombre("Nombre", nombre);
        validarNombre("Apellido", apellido);
        validarRol(rol);
        String correoNormalizado = correo.trim().toLowerCase();
        if (usuarioRepository.findByCorreoIgnoreCase(correoNormalizado).isPresent()) {
            throw new ReglaNegocioException("Ya existe una cuenta con ese correo.");
        }
        Usuario usuario = new Usuario();
        usuario.setNombre(nombre.trim());
        usuario.setApellido(apellido.trim());
        usuario.setCorreo(correoNormalizado);
        usuario.setContrasena(SIN_CONTRASENA);
        usuario.setRol(rol);
        usuario.setActivo(true);
        return UsuarioRespuesta.de(usuarioRepository.save(usuario));
    }

    /** Edita nombre, apellido, correo y rol. La contraseña de la persona se conserva. */
    @Transactional
    public UsuarioRespuesta editar(Long idAdministrador, Long idUsuario, String nombre, String apellido,
                                   String correo, String rol) {
        Usuario admin = buscarAdministrador(idAdministrador);
        Usuario usuario = buscar(idUsuario);
        validarNombre("Nombre", nombre);
        validarNombre("Apellido", apellido);
        validarRol(rol);
        String correoNormalizado = correo.trim().toLowerCase();
        usuarioRepository.findByCorreoIgnoreCase(correoNormalizado)
                .filter(otro -> !otro.getId().equals(idUsuario))
                .ifPresent(otro -> {
                    throw new ReglaNegocioException("Ya existe una cuenta con ese correo.");
                });
        if (!usuario.getRol().equals(rol)) {
            if (usuario.getId().equals(admin.getId())) {
                throw new ReglaNegocioException("No podés cambiar tu propio rol.");
            }
            exigirOtroAdministrador(usuario);
        }
        usuario.setNombre(nombre.trim());
        usuario.setApellido(apellido.trim());
        usuario.setCorreo(correoNormalizado);
        usuario.setRol(rol);
        return UsuarioRespuesta.de(usuarioRepository.save(usuario));
    }

    /** Activa o desactiva una cuenta. Sus pedidos se conservan: no se cancelan solos. */
    @Transactional
    public UsuarioRespuesta cambiarActivo(Long idAdministrador, Long idUsuario, boolean activo) {
        Usuario admin = buscarAdministrador(idAdministrador);
        Usuario usuario = buscar(idUsuario);
        if (usuario.getId().equals(admin.getId())) {
            throw new ReglaNegocioException("No podés desactivar tu propia cuenta.");
        }
        if (!activo) {
            exigirOtroAdministrador(usuario);
        }
        usuario.setActivo(activo);
        return UsuarioRespuesta.de(usuarioRepository.save(usuario));
    }

    /** Mejora · pedido fuera de horario: el administrador elige a qué empleado cargarle. */
    @Transactional(readOnly = true)
    public List<UsuarioRespuesta> empleadosActivos(Long idAdministrador) {
        buscarAdministrador(idAdministrador);
        return usuarioRepository.findByRolAndActivoTrueOrderByApellidoAscNombreAsc(Usuario.ROL_EMPLEADO)
                .stream().filter(u -> !pendiente(u)).map(UsuarioRespuesta::de).toList();
    }

    // ------------------------------------------------------------------ comprobaciones

    /** Lo usan M2 y M4: solo un empleado activo registra asistencia y pedidos. */
    @Transactional(readOnly = true)
    public Usuario buscarEmpleadoActivo(Long idUsuario) {
        Usuario usuario = buscar(idUsuario);
        if (!Boolean.TRUE.equals(usuario.getActivo()) || pendiente(usuario)
                || !Usuario.ROL_EMPLEADO.equals(usuario.getRol())) {
            throw new ReglaNegocioException("Esta acción es solo para empleados activos.");
        }
        return usuario;
    }

    /** Las pantallas del administrador (consolidado, usuarios, menús, feriados…). */
    @Transactional(readOnly = true)
    public Usuario buscarAdministrador(Long idUsuario) {
        Usuario usuario = buscar(idUsuario);
        if (!Boolean.TRUE.equals(usuario.getActivo()) || pendiente(usuario)
                || !Usuario.ROL_ADMINISTRADOR.equals(usuario.getRol())) {
            throw new AccesoDenegadoException("Esta acción es solo para el administrador.");
        }
        return usuario;
    }

    private Usuario buscar(Long idUsuario) {
        return usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el usuario " + idUsuario + "."));
    }

    /** Si el usuario es el último administrador activo, no se le puede quitar el rol ni desactivar. */
    private void exigirOtroAdministrador(Usuario usuario) {
        boolean esAdminActivo = Usuario.ROL_ADMINISTRADOR.equals(usuario.getRol())
                && Boolean.TRUE.equals(usuario.getActivo()) && !pendiente(usuario);
        if (!esAdminActivo) {
            return;
        }
        long adminsActivos = usuarioRepository.findByRolAndActivoTrueOrderByApellidoAscNombreAsc(Usuario.ROL_ADMINISTRADOR)
                .stream().filter(u -> !pendiente(u)).count();
        if (adminsActivos <= 1) {
            throw new ReglaNegocioException("Debe quedar al menos un administrador activo.");
        }
    }

    private static void validarRol(String rol) {
        if (!Usuario.ROL_EMPLEADO.equals(rol) && !Usuario.ROL_ADMINISTRADOR.equals(rol)) {
            throw new ReglaNegocioException("Elegí un rol válido (EMPLEADO o ADMINISTRADOR).");
        }
    }

    private static void validarNombre(String campo, String valor) {
        if (valor == null || valor.trim().length() < 2 || valor.trim().length() > 60 || !valor.trim().matches(NOMBRE)) {
            throw new ReglaNegocioException(campo + ": de 2 a 60 letras.");
        }
    }
}
