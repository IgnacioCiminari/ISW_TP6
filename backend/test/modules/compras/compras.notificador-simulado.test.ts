import { describe, expect, it } from 'vitest';
import { NotificadorSimulado } from '../../../src/modules/compras/compras.notificador-simulado';

describe('NotificadorSimulado', () => {
  it('finaliza el envío sin llamar un proveedor externo', async () => {
    const notificador = new NotificadorSimulado();

    await expect(
      notificador.enviarConfirmacion('visitante@mail.com', {
        numeroOrden: 'ORD-123',
        fechaVisita: new Date(2026, 9, 20), // martes 20/10/2026
        cantidadEntradas: 1,
        formaPago: 'EFECTIVO',
        detalle: { subtotales: [], total: 0 },
        codigoQR: 'QR-ORD-123',
      }),
    ).resolves.toBeUndefined();
  });
});
