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
  });
});
