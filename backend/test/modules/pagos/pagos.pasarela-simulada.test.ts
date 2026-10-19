import { describe, expect, it } from 'vitest';
import { PasarelaPagoSimulada } from '../../../src/modules/pagos/pagos.pasarela-simulada';

describe('PasarelaPagoSimulada', () => {
  it('devuelve una preferencia determinista sin usar red', async () => {
    const pasarela = new PasarelaPagoSimulada('https://pago.simulado/checkout');

    await expect(pasarela.crearPreferencia('ORD-123', 25000)).resolves.toEqual({
      id: 'PREF-ORD-123',
      urlRedireccion: 'https://pago.simulado/checkout',
    });
  });
});
