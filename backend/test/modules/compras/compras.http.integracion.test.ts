import { afterEach, describe, expect, it } from 'vitest';
import type { Server } from 'node:http';
import { crearAplicacion } from '../../../src/aplicacion';
import { crearServidor } from '../../../src/servidor-http';
import { NotificadorFalso } from '../../fakes/notificador.falso';
import { PasarelaPagoFalsa } from '../../fakes/pasarela-pago.falsa';

const crearSistemaDePrueba = async () => {
  const pasarela = new PasarelaPagoFalsa({
    id: 'PREF-PRUEBA',
    urlRedireccion: 'https://pago.simulado/checkout',
  });
  const notificador = new NotificadorFalso();
  const aplicacion = crearAplicacion({ ruta: ':memory:', pasarela, notificador });
  aplicacion.conexion.baseDatos
    .prepare('INSERT INTO usuarios(email) VALUES (?)')
    .run('visitante@mail.com');
  const servidor = crearServidor(aplicacion.controlador);
  await new Promise<void>((resolve) => servidor.listen(0, '127.0.0.1', resolve));
  const direccion = servidor.address();
  if (!direccion || typeof direccion === 'string') throw new Error('No se pudo obtener el puerto.');
  return {
    aplicacion,
    servidor,
    pasarela,
    notificador,
    url: `http://127.0.0.1:${direccion.port}/api/compras`,
  };
};

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
    const sistema = await crearSistemaDePrueba();
    const { aplicacion, pasarela, notificador } = sistema;
    cerrarBaseDatos = () => aplicacion.conexion.cerrar();
    servidor = sistema.servidor;

    const respuesta = await fetch(sistema.url, {
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
    expect(pasarela.llamadas).toEqual([{ numeroOrden: cuerpo.numeroOrden, total: 25000 }]);
    expect(notificador.llamadas).toEqual([
      expect.objectContaining({
        email: 'visitante@mail.com',
        resumen: expect.objectContaining({
          numeroOrden: cuerpo.numeroOrden,
          cantidadEntradas: 2,
          codigoQR: `QR-${cuerpo.numeroOrden}`,
        }),
      }),
    ]);
  });
});
