package com.grupo5.pedidos.servicio;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Test de la regla de negocio central: "cada día se puede cambiar hasta la hora de corte
 * (10:00 por defecto, hora de Argentina) de ese mismo día". No necesita MySQL ni Spring: el reloj se fija.
 *
 * Correrlo solo:  ./mvnw test -Dtest=ReglaHorarioTest
 */
class ReglaHorarioTest {

    private static final ZoneId ARGENTINA = ZoneId.of("America/Argentina/Buenos_Aires");
    private static final LocalDate MARTES = LocalDate.of(2026, 11, 17);

    /** Una ReglaHorario cuyo "ahora" es el martes 17/11/2026 a la hora indicada (Argentina). */
    private static ReglaHorario aLas(int hora, int minuto) {
        ZonedDateTime ahora = ZonedDateTime.of(MARTES.atTime(hora, minuto), ARGENTINA);
        return new ReglaHorario(Clock.fixed(ahora.toInstant(), ARGENTINA));
    }

    @Test
    @DisplayName("Hoy antes de las 10:00 todavía se puede cambiar")
    void hoyAntesDelCorteEstaAbierto() {
        assertFalse(aLas(9, 59).estaCerrado(MARTES));
    }

    @Test
    @DisplayName("Hoy a las 10:00 en punto ya está cerrado")
    void hoyALasDiezEstaCerrado() {
        assertTrue(aLas(10, 0).estaCerrado(MARTES));
    }

    @Test
    @DisplayName("Un día que ya pasó está cerrado, aunque sea temprano")
    void ayerEstaCerrado() {
        assertTrue(aLas(7, 0).estaCerrado(MARTES.minusDays(1)));
    }

    @Test
    @DisplayName("Mañana está abierto, aunque hoy ya hayan pasado las 10:00")
    void mananaEstaAbierto() {
        assertFalse(aLas(23, 59).estaCerrado(MARTES.plusDays(1)));
    }

    @Test
    @DisplayName("El corte es hora de Argentina aunque el servidor esté en otra zona")
    void elCorteEsHoraArgentina() {
        // 12:30 UTC = 09:30 en Argentina → todavía abierto.
        ZonedDateTime enUtc = ZonedDateTime.of(MARTES.atTime(12, 30), ZoneId.of("UTC"));
        ReglaHorario regla = new ReglaHorario(Clock.fixed(enUtc.toInstant(), ARGENTINA));
        assertFalse(regla.estaCerrado(MARTES));
    }

    @Test
    @DisplayName("Con pedidos.hora-corte=12:30, a las 11:00 todavía se puede y a las 12:30 ya no")
    void horaDeCorteConfigurable() {
        ZonedDateTime once = ZonedDateTime.of(MARTES.atTime(11, 0), ARGENTINA);
        ZonedDateTime docemedia = ZonedDateTime.of(MARTES.atTime(12, 30), ARGENTINA);
        assertFalse(new ReglaHorario(Clock.fixed(once.toInstant(), ARGENTINA), LocalTime.of(12, 30)).estaCerrado(MARTES));
        assertTrue(new ReglaHorario(Clock.fixed(docemedia.toInstant(), ARGENTINA), LocalTime.of(12, 30)).estaCerrado(MARTES));
        assertEquals("12:30", new ReglaHorario(Clock.fixed(once.toInstant(), ARGENTINA), "12:30").horaCorteTexto());
    }

    @Test
    @DisplayName("lunesDe devuelve el lunes de la semana")
    void lunesDeLaSemana() {
        assertEquals(LocalDate.of(2026, 11, 16), ReglaHorario.lunesDe(LocalDate.of(2026, 11, 20)));
        assertEquals(LocalDate.of(2026, 11, 16), ReglaHorario.lunesDe(LocalDate.of(2026, 11, 16)));
    }

    @Test
    @DisplayName("sábado y domingo son fin de semana; viernes no")
    void finDeSemana() {
        assertTrue(ReglaHorario.esFinDeSemana(LocalDate.of(2026, 11, 14)));
        assertTrue(ReglaHorario.esFinDeSemana(LocalDate.of(2026, 11, 15)));
        assertFalse(ReglaHorario.esFinDeSemana(LocalDate.of(2026, 11, 13)));
    }
}
