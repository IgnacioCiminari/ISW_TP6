import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import { ParqueService } from '../src/modules/parque/parque.service';

// fecha(2026, 10, 14) = 14/10/2026 en hora local (el helper corrige el mes 0-11 de Date).
const fecha = (anio: number, mes: number, dia: number, hora = 0, minuto = 0) =>
  new Date(anio, mes - 1, dia, hora, minuto);

describe('ParqueService', () => {
  const parque = new ParqueService();

  describe('estaAbierto', () => {
    it.each([
      ['martes', fecha(2026, 10, 20)],
      ['miércoles', fecha(2026, 10, 14)],
      ['sábado', fecha(2026, 10, 17)],
      ['domingo', fecha(2026, 10, 18)],
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
    // Miércoles 14/10/2026 a las 10:00
    const ahora = fecha(2026, 10, 14, 10, 0);

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

    it('rechaza una fecha con más de un mes de anticipación', () => {
      expect(() => parque.validarFechaVisita(fecha(2026, 11, 15), ahora)).toThrow(
        'No se pueden comprar entradas con más de un mes de anticipación.',
      );
    });

    // =====
    it('rechaza el día actual si se compra después de las 17:30', () => {
      expect(() =>
        parque.validarFechaVisita(fecha(2026, 10, 14), fecha(2026, 10, 14, 17, 31)),
      ).toThrow('Las entradas para el día actual solo pueden comprarse hasta las 17:30.');
    });

    it('acepta el día actual si se compra antes de las 17:30', () => {
      expect(() => parque.validarFechaVisita(fecha(2026, 10, 14), ahora)).not.toThrow();
    });

    it('acepta el día actual si se compra exactamente a las 17:30', () => {
      expect(() =>
        parque.validarFechaVisita(fecha(2026, 10, 14), fecha(2026, 10, 14, 17, 30)),
      ).not.toThrow();
    });

    it('rechaza el 25 de diciembre porque el parque está cerrado', () => {
      expect(() =>
        parque.validarFechaVisita(fecha(2026, 12, 25), fecha(2026, 12, 1, 10, 0)),
      ).toThrow('El parque está cerrado en la fecha seleccionada.');
    });

    it('acepta una fecha exactamente un mes después de hoy', () => {
      expect(() => parque.validarFechaVisita(fecha(2026, 11, 14), ahora)).not.toThrow();
    });
  });

  // En Docker el proceso corre en UTC: las reglas horarias tienen que seguir en hora de Córdoba.
  describe('validarFechaVisita con el proceso en UTC', () => {
    const zonaOriginal = process.env.TZ;

    beforeEach(() => {
      process.env.TZ = 'UTC';
    });

    afterEach(() => {
      if (zonaOriginal === undefined) delete process.env.TZ;
      else process.env.TZ = zonaOriginal;
    });

    it('acepta el día actual a las 15:00 de Córdoba aunque en UTC ya pasaron las 17:30', () => {
      const ahora = new Date('2026-10-14T15:00:00-03:00'); // miércoles 14/10/2026, 18:00 UTC

      expect(() => parque.validarFechaVisita(fecha(2026, 10, 14), ahora)).not.toThrow();
    });
  });
});
