import { describe, it, expect, vi } from 'vitest';
import { ComprasService } from '../src/modules/compras/compras.service';
import type {
  NuevaCompra,
  ResumenCompra,
  SolicitudCompra,
} from '../src/modules/compras/compras.types';
import type { DetallePrecio, ResultadoPago, Visitante } from '../src/modules/pagos/pagos.types';

// Tests unitarios: parque, pagos, repositorios y mail son fakes,
// así ComprasService se puede desarrollar sin esperar a los otros módulos.

const EMAIL = 'visitante@mail.com';
const FECHA_VISITA = new Date(2026, 9, 15); // jueves 15/10/2026
const URL_MP = 'https://sandbox.mercadopago.com.ar/checkout?pref_id=pref-123';

const DETALLE: DetallePrecio = {
  subtotales: [
    { edad: 35, tipoPase: 'VIP', precio: 20000 },
    { edad: 10, tipoPase: 'REGULAR', precio: 5000 },
  ],
  total: 25000,
};


const PAGO_TARJETA: ResultadoPago = {
  formaPago: 'TARJETA',
  estado: 'REDIRIGIDO_A_MERCADO_PAGO',
  urlRedireccion: URL_MP,
};

const PAGO_EFECTIVO: ResultadoPago = { formaPago: 'EFECTIVO', estado: 'PENDIENTE_EN_BOLETERIA' };

const visitantes = (cantidad: number): Visitante[] =>
  Array.from({ length: cantidad }, () => ({ edad: 30, tipoPase: 'REGULAR' }));

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

const crearDependencias = () => ({
  parque: { validarFechaVisita: vi.fn<(fechaVisita: Date, ahora?: Date) => void>() },
  pagos: {
    calcularDetalle: vi.fn<(visitantes: Visitante[]) => DetallePrecio>().mockReturnValue(DETALLE),
    procesarPago: vi.fn<() => Promise<ResultadoPago>>().mockResolvedValue(PAGO_TARJETA),
  },
  compras: {
    contarEntradas: vi.fn<(email: string, fecha: Date) => Promise<number>>().mockResolvedValue(0),
    guardar: vi.fn<(compra: NuevaCompra) => Promise<string>>().mockResolvedValue('ORD-0001'),
  },
  notificador: {
    enviarConfirmacion: vi
      .fn<(email: string, resumen: ResumenCompra) => Promise<void>>()
      .mockResolvedValue(undefined),
  },
  usuarios: {
  estaRegistrado: vi.fn<(email: string) => Promise<boolean>>().mockResolvedValue(true),
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

    it('registra la compra con sus visitantes, forma de pago y detalle de precios', async () => {
      const deps = crearDependencias();
      const servicio = new ComprasService(deps);
      const solicitud = solicitudValida();

      await servicio.comprarEntradas(solicitud);

      expect(deps.pagos.calcularDetalle).toHaveBeenCalledWith(solicitud.visitantes);
      expect(deps.compras.guardar).toHaveBeenCalledWith({
        email: EMAIL,
        fechaVisita: FECHA_VISITA,
        visitantes: solicitud.visitantes,
        formaPago: 'TARJETA',
        detalle: DETALLE,
      });
    });

    it('envía el mail de confirmación con el resumen de la compra', async () => {
      const deps = crearDependencias();
      const servicio = new ComprasService(deps);

      await servicio.comprarEntradas(solicitudValida());

      expect(deps.notificador.enviarConfirmacion).toHaveBeenCalledWith(
        EMAIL,
        expect.objectContaining({
          numeroOrden: 'ORD-0001',
          fechaVisita: FECHA_VISITA,
          cantidadEntradas: 2,
          formaPago: 'TARJETA',
          detalle: DETALLE,
        }),
      );
    });

    it('el mail de confirmación incluye un código QR de acceso', async () => {
      const deps = crearDependencias();
      const servicio = new ComprasService(deps);

      await servicio.comprarEntradas(solicitudValida());

      expect(deps.notificador.enviarConfirmacion).toHaveBeenCalledOnce();
      const [, resumen] = deps.notificador.enviarConfirmacion.mock.calls[0]!;
      expect(resumen.codigoQR).toEqual(expect.any(String));
      expect(resumen.codigoQR.length).toBeGreaterThan(0);
    });

    it('valida la fecha de visita contra las reglas del parque', async () => {
      const deps = crearDependencias();
      const servicio = new ComprasService(deps);

      await servicio.comprarEntradas(solicitudValida());

      expect(deps.parque.validarFechaVisita).toHaveBeenCalledWith(FECHA_VISITA);
    });

    it('permite comprar 10 entradas en una sola transacción', async () => {
      const servicio = new ComprasService(crearDependencias());

      await expect(
        servicio.comprarEntradas(solicitudValida({ cantidad: 10, visitantes: visitantes(10) })),
      ).resolves.toMatchObject({ cantidadEntradas: 10 });
    });

    it('permite completar 10 entradas para una fecha sumando compras anteriores', async () => {
      const deps = crearDependencias();
      deps.compras.contarEntradas.mockResolvedValue(8);
      const servicio = new ComprasService(deps);

      await expect(servicio.comprarEntradas(solicitudValida())).resolves.toMatchObject({
        cantidadEntradas: 2,
      });
    });
  });
});

describe('validaciones', () => {
  it('rechaza la compra de un usuario no registrado', async () => {
    const deps = crearDependencias();
    deps.usuarios.estaRegistrado.mockResolvedValue(false);
    const servicio = new ComprasService(deps);

    await expect(servicio.comprarEntradas(solicitudValida())).rejects.toThrow(
      'Solo los usuarios registrados pueden comprar entradas.',
    );
    expect(deps.compras.guardar).not.toHaveBeenCalled();
  });

  it('rechaza la compra sin forma de pago seleccionada', async () => {
    const deps = crearDependencias();
    const servicio = new ComprasService(deps);

    await expect(
      servicio.comprarEntradas(solicitudValida({ formaPago: undefined })),
    ).rejects.toThrow('Debe seleccionar una forma de pago.');
    expect(deps.compras.guardar).not.toHaveBeenCalled();
    expect(deps.pagos.procesarPago).not.toHaveBeenCalled();
  });
    
  it('rechaza la compra si el parque está cerrado en la fecha elegida', async () => {
    const deps = crearDependencias();
    const fechaLunes = new Date(2026, 9, 26); // lunes 26/10/2026
    const servicio = new ComprasService(deps);
    
    deps.parque.validarFechaVisita.mockImplementation((fecha) => {
      if (fecha.getDay() === 1) {
        throw new Error('El parque está cerrado en la fecha seleccionada.');
      }
    });
     await expect(servicio.comprarEntradas(solicitudValida({fechaVisita: fechaLunes}))).rejects.toThrow(
      'El parque está cerrado en la fecha seleccionada.',
    );
    expect(deps.compras.guardar).not.toHaveBeenCalled();
  });
  
  it('rechaza la compra de más de 10 entradas', async () => {
    const deps = crearDependencias();
    const servicio = new ComprasService(deps);

    await expect(
      servicio.comprarEntradas(solicitudValida({ cantidad: 11, visitantes: visitantes(11) })),
    ).rejects.toThrow('No se pueden comprar más de 10 entradas.');
    expect(deps.compras.guardar).not.toHaveBeenCalled();
 });
 
  it('rechaza la compra de 0 entradas', async () => {
    const servicio = new ComprasService(crearDependencias());

    await expect(
      servicio.comprarEntradas(solicitudValida({ cantidad: 0, visitantes: [] })),
    ).rejects.toThrow('Debe comprar al menos una entrada.');
  });
  

})
