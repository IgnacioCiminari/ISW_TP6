import { describe, expect, it } from 'vitest';
import { NotificadorMail } from '../../../src/modules/compras/compras.notificador-mail';
import type { ResumenCompra } from '../../../src/modules/compras/compras.types';
import { TransporteMailFalso } from '../../fakes/transporte-mail.falso';
import { leerQR } from '../../helpers/leer-qr';

const REMITENTE = 'EcoHarmony Park <ecoharmonypark1@gmail.com>';
const EMAIL = 'visitante@mail.com';

const RESUMEN: ResumenCompra = {
  numeroOrden: 'ORD-123',
  fechaVisita: new Date(2026, 9, 24), // sábado 24/10/2026
  cantidadEntradas: 2,
  formaPago: 'EFECTIVO',
  detalle: {
    subtotales: [
      { edad: 35, tipoPase: 'VIP', precio: 20000 },
      { edad: 10, tipoPase: 'REGULAR', precio: 5000 },
    ],
    total: 25000,
  },
  entradas: [
    { edad: 35, tipoPase: 'VIP', precio: 20000, codigoQR: 'QR-ORD-123-1' },
    { edad: 10, tipoPase: 'REGULAR', precio: 5000, codigoQR: 'QR-ORD-123-2' },
  ],
};

describe('NotificadorMail', () => {
  describe('enviarConfirmacion', () => {
    it('envía por el transporte el mail de confirmación al comprador', async () => {
      const transporte = new TransporteMailFalso();
      const notificador = new NotificadorMail(transporte, REMITENTE);

      await notificador.enviarConfirmacion(EMAIL, RESUMEN);

      expect(transporte.enviados).toHaveLength(1);
      expect(transporte.enviados[0]).toMatchObject({
        de: REMITENTE,
        para: EMAIL,
        asunto: expect.stringContaining('ORD-123'),
      });
    });

    it('adjunta un QR legible con el código de cada entrada', async () => {
      const transporte = new TransporteMailFalso();
      const notificador = new NotificadorMail(transporte, REMITENTE);

      await notificador.enviarConfirmacion(EMAIL, RESUMEN);

      const adjuntos = transporte.enviados[0]!.adjuntos;
      expect(adjuntos.map((adjunto) => leerQR(adjunto.contenido))).toEqual([
        'QR-ORD-123-1',
        'QR-ORD-123-2',
      ]);
    });

    it('propaga el error si el transporte no puede enviar el mail', async () => {
      const error = new Error('SMTP no disponible');
      const notificador = new NotificadorMail(new TransporteMailFalso(error), REMITENTE);

      const envio = notificador.enviarConfirmacion(EMAIL, RESUMEN);

      await expect(envio).rejects.toThrow('SMTP no disponible');
    });
  });
});
