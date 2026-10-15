import { describe, it, expect, vi } from 'vitest';
import { PagosService } from '../src/modules/pagos/pagos.service';
import type { FormaPago, PasarelaPago, TipoPase } from '../src/modules/pagos/pagos.types';

const URL_MP = 'https://sandbox.mercadopago.com.ar/checkout?pref_id=pref-123';

const crearPasarelaFalsa = () => ({
  crearPreferencia: vi.fn<PasarelaPago['crearPreferencia']>().mockResolvedValue({
    id: 'pref-123',
    urlRedireccion: URL_MP,
  }),
});

describe('PagosService', () => {
  describe('calcularPrecioEntrada', () => {
    const pagos = new PagosService(crearPasarelaFalsa());

    it.each<[number, TipoPase, number]>([
      [30, 'VIP', 20000],
      [30, 'REGULAR', 10000],
      [0, 'VIP', 0],
      [3, 'REGULAR', 0],
      [4, 'VIP', 10000],
      [15, 'REGULAR', 5000],
    ])('un visitante de %i años con pase %s paga $%i', (edad, tipoPase, precioEsperado) => {
      expect(pagos.calcularPrecioEntrada(edad, tipoPase)).toBe(precioEsperado);
    });

  });
});
