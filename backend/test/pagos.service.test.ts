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

      expect(resultado).toEqual({ formaPago: 'EFECTIVO', estado: 'PENDIENTE_EN_BOLETERIA' });
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
});
