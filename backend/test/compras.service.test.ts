import { describe, it, expect, vi } from 'vitest';
import { ComprasService } from '../src/modules/compras/compras.service';
import type { SolicitudCompra } from '../src/modules/compras/compras.types';
import type { ResultadoPago } from '../src/modules/pagos/pagos.types';

// Tests unitarios: parque, pagos, repositorios y mail son fakes,
// así ComprasService se puede desarrollar sin esperar a los otros módulos.

const EMAIL = 'visitante@mail.com';
const FECHA_VISITA = new Date(2026, 9, 15); // jueves 15/10/2026
const URL_MP = 'https://sandbox.mercadopago.com.ar/checkout?pref_id=pref-123';

const PAGO_TARJETA: ResultadoPago = {
  formaPago: 'TARJETA',
  estado: 'REDIRIGIDO_A_MERCADO_PAGO',
  urlRedireccion: URL_MP,
};

const PAGO_EFECTIVO: ResultadoPago = { formaPago: 'EFECTIVO', estado: 'PENDIENTE_EN_BOLETERIA' };

const solicitudValida =(cambios: Partial<SolicitudCompra> = {}): SolicitudCompra => ({
  email: EMAIL,
  fechaVisita: FECHA_VISITA,
  cantidad: 2,
  visitantes: [
    { edad: 35, tipoPase: 'VIP' },
    { edad: 10, tipoPase: 'REGULAR' },
  ],
  formaPago: 'TARJETA',
  ...cambios,
});

const crearDependencias = () => ({
  pagos: {
    procesarPago: vi.fn<() => Promise<ResultadoPago>>().mockResolvedValue(PAGO_TARJETA),
  },
});

describe('ComprasService.comprarEntradas', () => {
  describe('compra exitosa', () => {
    it('informa número de orden, cantidad de entradas, fecha de visita y total', async () => {
      const servicio = new ComprasService(crearDependencias());

      const resultado = await servicio.comprarEntradas(solicitudValida());

      expect(resultado).toMatchObject({
        numeroOrden: 'ORD-0001',
        cantidadEntradas: 2,
        fechaVisita: FECHA_VISITA,
        total: 25000,
      });
    });

    it('con tarjeta devuelve la redirección a Mercado Pago', async () => {
      const deps = crearDependencias();
      const servicio = new ComprasService(deps);

      const resultado = await servicio.comprarEntradas(solicitudValida({ formaPago: 'TARJETA' }));

      expect(deps.pagos.procesarPago).toHaveBeenCalledWith('ORD-0001', 25000, 'TARJETA');
      expect(resultado.pago).toEqual(PAGO_TARJETA);
    });

    it('con efectivo deja el pago pendiente en boletería', async () => {
      const deps = crearDependencias();
      deps.pagos.procesarPago.mockResolvedValue(PAGO_EFECTIVO);
      const servicio = new ComprasService(deps);

      const resultado = await servicio.comprarEntradas(solicitudValida({ formaPago: 'EFECTIVO' }));

      expect(deps.pagos.procesarPago).toHaveBeenCalledWith('ORD-0001', 25000, 'EFECTIVO');
      expect(resultado.pago).toEqual(PAGO_EFECTIVO);
    });
  });
});
