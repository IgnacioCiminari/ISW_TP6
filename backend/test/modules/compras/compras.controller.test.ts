import { afterEach, describe, expect, it } from 'vitest';
import type { Server } from 'node:http';
import type { ComprasService } from '../../../src/modules/compras/compras.service';
import type { ResultadoCompra, SolicitudCompra } from '../../../src/modules/compras/compras.types';
import { crearServidor } from '../../../src/servidor-http';
import { CompraController } from '../../../src/modules/compras/compras.controller';

class ComprasServiceFalso implements Pick<ComprasService, 'comprarEntradas'> {
  solicitudes: SolicitudCompra[] = [];

  constructor(
    private readonly resultado: ResultadoCompra | Error,
  ) {}

  async comprarEntradas(solicitud: SolicitudCompra): Promise<ResultadoCompra> {
    this.solicitudes.push(solicitud);
    if (this.resultado instanceof Error) {
      throw this.resultado;
    }
    return this.resultado;
  }
}

const resultado: ResultadoCompra = {
  numeroOrden: 'ORD-1',
  cantidadEntradas: 1,
  fechaVisita: new Date(2026, 9, 20),
  total: 10000,
  pago: { formaPago: 'EFECTIVO', estado: 'PENDIENTE_EN_BOLETERIA' },
};

const cuerpoValido = {
  email: 'visitante@mail.com',
  fechaVisita: '2026-10-20',
  cantidad: 1,
  visitantes: [{ edad: 30, tipoPase: 'REGULAR' }],
  formaPago: 'EFECTIVO',
};

const iniciar = async (servicio: ComprasServiceFalso): Promise<{ servidor: Server; url: string }> => {
  const servidor = crearServidor(new CompraController(servicio));
  await new Promise<void>((resolve) => servidor.listen(0, '127.0.0.1', resolve));
  const direccion = servidor.address();
  if (!direccion || typeof direccion === 'string') throw new Error('No se pudo obtener el puerto.');
  return { servidor, url: `http://127.0.0.1:${direccion.port}/api/compras` };
};

describe('CompraController', () => {
  let servidor: Server | undefined;

  afterEach(async () => {
    if (servidor?.listening) await new Promise<void>((resolve, reject) => servidor?.close((error) => error ? reject(error) : resolve()));
  });

  it('confirma una solicitud válida con 201', async () => {
    const servicio = new ComprasServiceFalso(resultado);
    const sistema = await iniciar(servicio);
    servidor = sistema.servidor;

    const respuesta = await fetch(sistema.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(cuerpoValido),
    });

    expect(respuesta.status).toBe(201);
    expect(await respuesta.json()).toMatchObject({ numeroOrden: 'ORD-1' });
    expect(servicio.solicitudes).toEqual([{ ...cuerpoValido, fechaVisita: new Date(2026, 9, 20) }]);
  });

  it('rechaza JSON inválido con 400', async () => {
    const sistema = await iniciar(new ComprasServiceFalso(resultado));
    servidor = sistema.servidor;

    const respuesta = await fetch(sistema.url, { method: 'POST', body: '{' });

    expect(respuesta.status).toBe(400);
  });

  it('traduce errores de regla a 422', async () => {
    const sistema = await iniciar(
      new ComprasServiceFalso(new Error('El parque está cerrado en la fecha seleccionada.')),
    );
    servidor = sistema.servidor;

    const respuesta = await fetch(sistema.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(cuerpoValido),
    });

    expect(respuesta.status).toBe(422);
  });

  it('oculta errores inesperados con 500', async () => {
    const sistema = await iniciar(new ComprasServiceFalso(new Error('fallo de infraestructura')));
    servidor = sistema.servidor;

    const respuesta = await fetch(sistema.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(cuerpoValido),
    });

    expect(respuesta.status).toBe(500);
    await expect(respuesta.json()).resolves.toEqual({ error: 'Error interno.' });
  });
});
