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
  describe('procesarPago', () => {
    it('con efectivo deja el pago pendiente en boletería sin pasar por Mercado Pago', async () => {
      const pasarela = crearPasarelaFalsa();
      const pagos = new PagosService(pasarela);

      const resultado = await pagos.procesarPago('ORD-0001', 25000, 'EFECTIVO');

      expect(resultado).toEqual({
        formaPago: 'EFECTIVO',
        estado: 'PENDIENTE_EN_BOLETERIA',
      });
      expect(pasarela.crearPreferencia).not.toHaveBeenCalled();
    });

    it('con tarjeta crea la preferencia en Mercado Pago y devuelve la URL de redirección', async () => {
      const pasarela = crearPasarelaFalsa();
      const pagos = new PagosService(pasarela);

      const resultado = await pagos.procesarPago('ORD-0001', 25000, 'TARJETA');

      expect(pasarela.crearPreferencia).toHaveBeenCalledWith('ORD-0001', 25000);
      expect(resultado).toEqual({
        formaPago: 'TARJETA',
        estado: 'REDIRIGIDO_A_MERCADO_PAGO',
        urlRedireccion: URL_MP,
      });
    });

    it('rechaza una forma de pago no soportada', async () => {
      const pagos = new PagosService(crearPasarelaFalsa());

      await expect(pagos.procesarPago('ORD-0001', 25000, 'CHEQUE' as FormaPago)).rejects.toThrow(
        'Forma de pago no soportada.',
      );
    });

    it('informa un error claro si Mercado Pago no responde', async () => {
      const pasarela = crearPasarelaFalsa();
      pasarela.crearPreferencia.mockRejectedValue(new Error('timeout'));
      const pagos = new PagosService(pasarela);

      await expect(pagos.procesarPago('ORD-0001', 25000, 'TARJETA')).rejects.toThrow(
        'No se pudo iniciar el pago con Mercado Pago.',
      );
    });
  });

  describe('calcularPrecioEntrada', () => {
    const pagos = new PagosService(crearPasarelaFalsa());

    it.each<[number, TipoPase, number]>([
      [30, 'VIP', 20000],
      [30, 'REGULAR', 10000],
      [0, 'VIP', 0],
      [3, 'REGULAR', 0],
      [4, 'VIP', 10000],
      [15, 'REGULAR', 5000],
      [16, 'VIP', 20000],
      [59, 'REGULAR', 10000],
      [60, 'VIP', 10000],
      [85, 'REGULAR', 5000],
    ])('debe un visitante de %i años con pase %s pagar $%i', (edad, tipoPase, precioEsperado) => {
      expect(pagos.calcularPrecioEntrada(edad, tipoPase)).toBe(precioEsperado);
    });

    it('debe rechazar una edad negativa', () => {
      expect(() => pagos.calcularPrecioEntrada(-1, 'REGULAR')).toThrow(
        'La edad del visitante no es válida.',
      );
    });

    it('debe rechazar un tipo de pase inexistente', () => {
      expect(() => pagos.calcularPrecioEntrada(30, 'PLATINO' as TipoPase)).toThrow(
        'El tipo de pase debe ser VIP o REGULAR.',
      );
    });
  });

  describe('calcularDetalle', () => {
    const pagos = new PagosService(crearPasarelaFalsa());

    it('debe devolver el subtotal de cada visitante y el total de la compra', () => {
      const detalle = pagos.calcularDetalle([
        { edad: 40, tipoPase: 'VIP' },
        { edad: 10, tipoPase: 'REGULAR' },
        { edad: 2, tipoPase: 'VIP' },
      ]);

      expect(detalle).toEqual({
        subtotales: [
          { edad: 40, tipoPase: 'VIP', precio: 20000 },
          { edad: 10, tipoPase: 'REGULAR', precio: 5000 },
          { edad: 2, tipoPase: 'VIP', precio: 0 },
        ],
        total: 25000,
      });
    });
  });
});
