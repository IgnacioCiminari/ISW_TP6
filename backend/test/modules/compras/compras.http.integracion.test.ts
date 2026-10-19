import { afterEach, describe, expect, it } from 'vitest';
import type { Server } from 'node:http';
import { crearAplicacion } from '../../../src/aplicacion';
import { NotificadorSimulado } from '../../../src/modules/compras/compras.notificador-simulado';
import { PasarelaPagoSimulada } from '../../../src/modules/pagos/pagos.pasarela-simulada';
import { crearServidor } from '../../../src/servidor-http';

describe('POST /api/compras integrado', () => {
  let servidor: Server | undefined;
  let cerrarBaseDatos: (() => void) | undefined;

  afterEach(async () => {
    if (servidor?.listening) {
      await new Promise<void>((resolve, reject) =>
        servidor?.close((error) => error ? reject(error) : resolve()),
      );
    }
    cerrarBaseDatos?.();
  });

  it('persiste la compra y devuelve el pago con tarjeta simulado', async () => {
    const aplicacion = crearAplicacion({
      ruta: ':memory:',
      pasarela: new PasarelaPagoSimulada('https://pago.simulado/checkout'),
      notificador: new NotificadorSimulado(),
    });
    cerrarBaseDatos = () => aplicacion.conexion.cerrar();
    aplicacion.conexion.baseDatos
      .prepare('INSERT INTO usuarios(email) VALUES (?)')
      .run('visitante@mail.com');
    servidor = crearServidor(aplicacion.controlador);
    await new Promise<void>((resolve) => servidor?.listen(0, '127.0.0.1', resolve));
    const direccion = servidor.address();
    if (!direccion || typeof direccion === 'string') throw new Error('No se pudo obtener el puerto.');

    const respuesta = await fetch(`http://127.0.0.1:${direccion.port}/api/compras`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'visitante@mail.com',
        fechaVisita: '2026-10-20',
        cantidad: 2,
        visitantes: [
          { edad: 35, tipoPase: 'VIP' },
          { edad: 10, tipoPase: 'REGULAR' },
        ],
        formaPago: 'TARJETA',
      }),
    });
    const cuerpo = await respuesta.json() as { numeroOrden: string; pago: { urlRedireccion: string } };

    expect(respuesta.status).toBe(201);
    expect(cuerpo.numeroOrden).toMatch(/^ORD-/);
    expect(cuerpo.pago.urlRedireccion).toBe('https://pago.simulado/checkout');
    expect(
      aplicacion.conexion.baseDatos.prepare('SELECT COUNT(*) cantidad FROM compras').get(),
    ).toEqual({ cantidad: 1 });
    expect(
      aplicacion.conexion.baseDatos.prepare('SELECT COUNT(*) cantidad FROM entradas').get(),
    ).toEqual({ cantidad: 2 });
  });
});
