import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Server } from 'node:http';
import { crearAplicacion } from '../../../src/aplicacion';
import { NotificadorMail } from '../../../src/modules/compras/compras.notificador-mail';
import type { DependenciasCompras } from '../../../src/modules/compras/compras.types';
import { crearServidor } from '../../../src/servidor-http';
import { NotificadorFalso } from '../../fakes/notificador.falso';
import { PasarelaPagoFalsa } from '../../fakes/pasarela-pago.falsa';
import { TransporteMailFalso } from '../../fakes/transporte-mail.falso';
import { leerQR } from '../../helpers/leer-qr';

const SOLICITUD_VALIDA = {
  email: 'visitante@mail.com',
  fechaVisita: '2026-10-20',
  cantidad: 2,
  visitantes: [
    { edad: 35, tipoPase: 'VIP' },
    { edad: 10, tipoPase: 'REGULAR' },
  ],
  formaPago: 'TARJETA',
};

const crearSistemaDePrueba = async (notificador: DependenciasCompras['notificador']) => {
  const pasarela = new PasarelaPagoFalsa({
    id: 'PREF-PRUEBA',
    urlRedireccion: 'https://pago.simulado/checkout',
  });
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
    url: `http://127.0.0.1:${direccion.port}/api/compras`,
  };
};

describe('POST /api/compras integrado', () => {
  let servidor: Server | undefined;
  let cerrarBaseDatos: (() => void) | undefined;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 20, 10, 0)); // martes 20/10/2026, 10:00
  });

  afterEach(async () => {
    vi.useRealTimers();
    if (servidor?.listening) {
      await new Promise<void>((resolve, reject) =>
        servidor?.close((error) => (error ? reject(error) : resolve())),
      );
    }
    cerrarBaseDatos?.();
  });

  it('persiste la compra y devuelve el pago con tarjeta simulado', async () => {
    const notificador = new NotificadorFalso();
    const sistema = await crearSistemaDePrueba(notificador);
    const { aplicacion, pasarela } = sistema;
    cerrarBaseDatos = () => aplicacion.conexion.cerrar();
    servidor = sistema.servidor;

    const respuesta = await fetch(sistema.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(SOLICITUD_VALIDA),
    });
    const cuerpo = (await respuesta.json()) as {
      numeroOrden: string;
      pago: { urlRedireccion: string };
    };

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
          entradas: [
            expect.objectContaining({ edad: 35, tipoPase: 'VIP', codigoQR: expect.any(String) }),
            expect.objectContaining({
              edad: 10,
              tipoPase: 'REGULAR',
              codigoQR: expect.any(String),
            }),
          ],
        }),
      }),
    ]);
  });

  // Toda la cadena real hasta el mail armado: solo se reemplaza la salida SMTP.
  it('envía al comprador el mail de confirmación con un QR legible por entrada', async () => {
    const transporte = new TransporteMailFalso();
    const sistema = await crearSistemaDePrueba(
      new NotificadorMail(transporte, 'EcoHarmony Park <ecoharmonypark1@gmail.com>'),
    );
    cerrarBaseDatos = () => sistema.aplicacion.conexion.cerrar();
    servidor = sistema.servidor;

    const respuesta = await fetch(sistema.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(SOLICITUD_VALIDA),
    });
    const cuerpo = (await respuesta.json()) as { numeroOrden: string };

    expect(respuesta.status).toBe(201);
    expect(transporte.enviados).toHaveLength(1);
    const [mail] = transporte.enviados;
    expect(mail!.para).toBe('visitante@mail.com');
    expect(mail!.asunto).toContain(cuerpo.numeroOrden);
    expect(mail!.adjuntos.map((adjunto) => leerQR(adjunto.contenido))).toEqual([
      `QR-${cuerpo.numeroOrden}-1`,
      `QR-${cuerpo.numeroOrden}-2`,
    ]);
  });
});
