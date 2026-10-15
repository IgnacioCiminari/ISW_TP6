import { describe, it, expect } from 'vitest';
import { ComprasService } from '../src/modules/compras/compras.service';
import type { DependenciasCompras, SolicitudCompra } from '../src/modules/compras/compras.types';

// Tests unitarios: parque, pagos, repositorios y mail son fakes,
// así ComprasService se puede desarrollar sin esperar a los otros módulos.

const EMAIL = 'visitante@mail.com';
const FECHA_VISITA = new Date(2026, 9, 15); // jueves 15/10/2026

const solicitudValida = (cambios: Partial<SolicitudCompra> = {}): SolicitudCompra => ({
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

const crearDependencias = (): DependenciasCompras => ({});

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
  });
});
