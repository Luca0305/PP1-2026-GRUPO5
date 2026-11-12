package com.grupo5.pedidos.servicio;

import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

import org.springframework.stereotype.Component;

/**
 * Las contraseñas NUEVAS se guardan como huella PBKDF2 (viene con Java, sin dependencias):
 *   pbkdf2$120000$<sal en Base64>$<huella en Base64>
 * Las cuentas que trae el script tienen 'cambiar123' en texto plano A PROPÓSITO
 * (lo dice su encabezado); para esas se compara el texto tal cual.
 */
@Component
public class ContrasenaService {

    private static final String PREFIJO = "pbkdf2";
    private static final int ITERACIONES = 120_000;
    private static final int BITS = 256;
    private final SecureRandom azar = new SecureRandom();

    public String huella(String contrasena) {
        byte[] sal = new byte[16];
        azar.nextBytes(sal);
        byte[] hash = derivar(contrasena, sal, ITERACIONES);
        Base64.Encoder b64 = Base64.getEncoder();
        return PREFIJO + "$" + ITERACIONES + "$" + b64.encodeToString(sal) + "$" + b64.encodeToString(hash);
    }

    public boolean coincide(String contrasena, String guardada) {
        if (guardada == null || contrasena == null) {
            return false;
        }
        String[] partes = guardada.split("\\$");
        if (partes.length != 4 || !PREFIJO.equals(partes[0])) {
            // Cuenta del script: texto plano.
            return MessageDigest.isEqual(contrasena.getBytes(), guardada.getBytes());
        }
        Base64.Decoder b64 = Base64.getDecoder();
        byte[] esperado = b64.decode(partes[3]);
        byte[] calculado = derivar(contrasena, b64.decode(partes[2]), Integer.parseInt(partes[1]));
        return MessageDigest.isEqual(esperado, calculado);
    }

    private static byte[] derivar(String contrasena, byte[] sal, int iteraciones) {
        try {
            PBEKeySpec spec = new PBEKeySpec(contrasena.toCharArray(), sal, iteraciones, BITS);
            return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("No se pudo calcular la huella de la contraseña.", e);
        }
    }
}
