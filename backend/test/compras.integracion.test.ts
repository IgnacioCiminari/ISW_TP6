import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ComprasService } from '../src/modules/compras/compras.service';
import { PagosService } from '../src/modules/pagos/pagos.service';
import { ParqueService } from '../src/modules/parque/parque.service';
import type { NuevaCompra, ResumenCompra } from '../src/modules/compras/compras.types';
import type { Visitante } from '../src/modules/pagos/pagos.types';

// Pruebas de usuario de la US "Comprar entradas" con los servicios reales.
// Solo Mercado Pago, la persistencia y el mail son fakes.
// Estos tests pasan a verde recién cuando parque, pagos y compras están terminados.

const URL_MP = 'https://sandbox.mercadopago.com.ar/checkout?pref_id=pref-123';

const crearSistema = () => {
  const pasarela = {
    crearPreferencia: vi
      .fn<(numeroOrden: string, total: number) => Promise<{ id: string; urlRedireccion: string }>>()
      .mockResolvedValue({ id: 'pref-123', urlRedireccion: URL_MP }),
  };
  const notificador = {
    enviarConfirmacion: vi
      .fn<(email: string, resumen: ResumenCompra) => Promise<void>>()
      .mockResolvedValue(undefined),
  };
  const servicio = new ComprasService({
    parque: new ParqueService(),
    pagos: new PagosService(pasarela),
    usuarios: { estaRegistrado: async () => true },
    compras: {
      contarEntradas: async () => 0,
      guardar: async (_compra: NuevaCompra) => 'ORD-0001',
    },
    notificador,
  });
  return { servicio, pasarela, notificador };
};

const visitantes = (cantidad: number): Visitante[] =>
  Array.from({ length: cantidad }, () => ({ edad: 30, tipoPase: 'REGULAR' }));

describe('US Comprar entradas - pruebas de usuario', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 14, 10, 0)); // miércoles 14/10/2026 10:00
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('compra con fecha disponible, menos de 10 entradas, edades, tipo de pase, tarjeta y mail (pasa)', async () => {
    const { servicio, pasarela, notificador } = crearSistema();

    const resultado = await servicio.comprarEntradas({
      email: 'visitante@mail.com',
      fechaVisita: new Date(2026, 9, 15),
      cantidad: 3,
      visitantes: [
        { edad: 40, tipoPase: 'VIP' },
        { edad: 12, tipoPase: 'REGULAR' },
        { edad: 65, tipoPase: 'REGULAR' },
      ],
      formaPago: 'TARJETA',
    });

    expect(resultado).toMatchObject({
      numeroOrden: 'ORD-0001',
      cantidadEntradas: 3,
      fechaVisita: new Date(2026, 9, 15),
      total: 30000,
      pago: { formaPago: 'TARJETA', urlRedireccion: URL_MP },
    });
    expect(pasarela.crearPreferencia).toHaveBeenCalledWith('ORD-0001', 30000);
    expect(notificador.enviarConfirmacion).toHaveBeenCalledWith(
      'visitante@mail.com',
      expect.objectContaining({ numeroOrden: 'ORD-0001', cantidadEntradas: 3 }),
    );
  });

  it('compra sin seleccionar forma de pago (falla)', async () => {
    const { servicio } = crearSistema();

    await expect(
      // @ts-expect-error: se omite formaPago a propósito para probar la validación
      servicio.comprarEntradas({
        email: 'visitante@mail.com',
        fechaVisita: new Date(2026, 9, 15),
        cantidad: 2,
        visitantes: visitantes(2),
      }),
    ).rejects.toThrow('Debe seleccionar una forma de pago.');
  });

  it('compra para una fecha en la que el parque está cerrado (falla)', async () => {
    const { servicio } = crearSistema();

    await expect(
      servicio.comprarEntradas({
        email: 'visitante@mail.com',
        fechaVisita: new Date(2026, 9, 19), // lunes
        cantidad: 2,
        visitantes: visitantes(2),
        formaPago: 'EFECTIVO',
      }),
    ).rejects.toThrow('El parque está cerrado en la fecha seleccionada.');
  });

  it('compra de más de 10 entradas (falla)', async () => {
    const { servicio } = crearSistema();

    await expect(
      servicio.comprarEntradas({
        email: 'visitante@mail.com',
        fechaVisita: new Date(2026, 9, 15),
        cantidad: 11,
        visitantes: visitantes(11),
        formaPago: 'TARJETA',
      }),
    ).rejects.toThrow('No se pueden comprar más de 10 entradas.');
  });
});
