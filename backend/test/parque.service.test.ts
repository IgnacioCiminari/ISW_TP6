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
  });
});