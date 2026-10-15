import { describe, it, expect } from 'vitest';
import { ParqueService } from '../src/modules/parque/parque.service';

// fecha(2026, 10, 14) = 14/10/2026 en hora local (el helper corrige el mes 0-11 de Date).
const fecha = (anio: number, mes: number, dia: number, hora = 0, minuto = 0) =>
  new Date(anio, mes - 1, dia, hora, minuto);

describe('ParqueService', () => {
  const parque = new ParqueService();

  describe('estaAbierto', () => {
    it.each([
      ['martes', fecha(2026, 10, 20)]
    ])('está abierto un %s', (_dia, dia) => {
      expect(parque.estaAbierto(dia)).toBe(true);
    });

    it('está cerrado los lunes', () => {
      expect(parque.estaAbierto(fecha(2026, 10, 19))).toBe(false);
    });

    it('está cerrado el 25 de diciembre', () => {
      expect(parque.estaAbierto(fecha(2026, 12, 25))).toBe(false);
    });

    it('está cerrado el 1 de enero', () => {
      expect(parque.estaAbierto(fecha(2027, 1, 1))).toBe(false);
    });

    it('está abierto el 24 de diciembre (no es feriado del parque)', () => {
      expect(parque.estaAbierto(fecha(2026, 12, 24))).toBe(true);
    });
  });

  describe('validarFechaVisita', () => {
    // Miércoles 15/10/2026 a las 10:00
    const ahora = fecha(2026, 10, 15, 10, 0);

    it('acepta una fecha futura en la que el parque está abierto', () => {
      expect(() => parque.validarFechaVisita(fecha(2026, 10, 15), ahora)).not.toThrow();
    });

    it('rechaza una fecha anterior al día actual', () => {
        expect(() => parque.validarFechaVisita(fecha(2026, 10, 13), ahora)).toThrow(
            'La fecha de visita no puede ser anterior al día actual.',
        );
    });

    it('rechaza un lunes porque el parque está cerrado', () => {
        expect(() => parque.validarFechaVisita(fecha(2026, 10, 19), ahora)).toThrow(
            'El parque está cerrado en la fecha seleccionada.',
        );
    });

  });
});