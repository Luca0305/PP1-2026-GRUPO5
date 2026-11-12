package com.grupo5.pedidos.servicio;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * LA regla de negocio central del TP, en un solo lugar:
 * "cada día se puede cambiar hasta la HORA DE CORTE (hora de Argentina) de ese mismo día".
 * La usan Mis días (M2) y Mi pedido (M4). Tiene test JUnit: ReglaHorarioTest.
 *
 * La hora de corte se configura en application.properties:  pedidos.hora-corte=10:00
 * (si no está, vale 10:00). El frontend la lee de GET /api/configuracion, así la
 * pantalla y el servidor siempre usan la misma hora.
 *
 * No depende de la base: recibe un Clock, así el test fija la hora.
 */
@Component
public class ReglaHorario {

    public static final LocalTime HORA_DE_CORTE_POR_DEFECTO = LocalTime.of(10, 0);

    private final Clock reloj;
    private final LocalTime horaCorte;

    // Spring usa este: la hora sale de application.properties.
    @Autowired
    public ReglaHorario(Clock reloj, @Value("${pedidos.hora-corte:10:00}") String horaCorte) {
        this(reloj, LocalTime.parse(horaCorte.trim()));
    }

    public ReglaHorario(Clock reloj, LocalTime horaCorte) {
        this.reloj = reloj;
        this.horaCorte = horaCorte;
    }

    // Para los tests: corte a las 10:00.
    public ReglaHorario(Clock reloj) {
        this(reloj, HORA_DE_CORTE_POR_DEFECTO);
    }

    public LocalDate hoy() {
        return LocalDate.now(reloj);
    }

    public LocalTime horaCorte() {
        return horaCorte;
    }

    /** "10:00", para los mensajes de error. */
    public String horaCorteTexto() {
        return String.format("%02d:%02d", horaCorte.getHour(), horaCorte.getMinute());
    }

    /** Cerrado = el día ya pasó, o es hoy y ya es la hora de corte o más. */
    public boolean estaCerrado(LocalDate fecha) {
        LocalDateTime ahora = LocalDateTime.now(reloj);
        LocalDate hoy = ahora.toLocalDate();
        return fecha.isBefore(hoy)
                || (fecha.equals(hoy) && !ahora.toLocalTime().isBefore(horaCorte));
    }

    /** El lunes de la semana de esa fecha. */
    public static LocalDate lunesDe(LocalDate fecha) {
        return fecha.minusDays(fecha.getDayOfWeek().getValue() - DayOfWeek.MONDAY.getValue());
    }

    /** Sábado y domingo no hay servicio. */
    public static boolean esFinDeSemana(LocalDate fecha) {
        return fecha.getDayOfWeek() == DayOfWeek.SATURDAY || fecha.getDayOfWeek() == DayOfWeek.SUNDAY;
    }
}
