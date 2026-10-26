import nodemailer from 'nodemailer';
import { describe, expect, it, vi } from 'vitest';
import { TransporteSmtp } from '../../../src/modules/compras/compras.transporte-smtp';
import type { MensajeMail } from '../../../src/modules/compras/compras.mail.types';

const MENSAJE: MensajeMail = {
  de: 'EcoHarmony Park <ecoharmonypark1@gmail.com>',
  para: 'visitante@mail.com',
  asunto: 'Confirmación de tu compra ORD-123 · EcoHarmony Park',
  html: '<img src="cid:qr-1@ecoharmonypark">',
  texto: 'Orden: ORD-123',
  adjuntos: [
    { nombre: 'QR-ORD-123-1.png', contenido: Buffer.from('png-qr-1'), cid: 'qr-1@ecoharmonypark' },
  ],
};

// jsonTransport arma el mail igual que SMTP pero lo devuelve como JSON en vez de enviarlo.
const enviarSinRed = async (mensaje: MensajeMail) => {
  const transportador = nodemailer.createTransport({ jsonTransport: true });
  const sendMail = vi.spyOn(transportador, 'sendMail');

  await new TransporteSmtp(transportador).enviar(mensaje);

  const info = (await sendMail.mock.results[0]!.value) as { message: string };
  return JSON.parse(info.message);
};

describe('TransporteSmtp', () => {
  describe('enviar', () => {
    it('envía el mail con remitente, destinatario, asunto y cuerpos', async () => {
      const enviado = await enviarSinRed(MENSAJE);

      expect(enviado).toMatchObject({
        from: { name: 'EcoHarmony Park', address: 'ecoharmonypark1@gmail.com' },
        to: [{ address: 'visitante@mail.com' }],
        subject: 'Confirmación de tu compra ORD-123 · EcoHarmony Park',
        html: '<img src="cid:qr-1@ecoharmonypark">',
        text: 'Orden: ORD-123',
      });
    });

    it('adjunta cada QR como imagen PNG embebida con su cid', async () => {
      const enviado = await enviarSinRed(MENSAJE);

      expect(enviado.attachments).toEqual([
        expect.objectContaining({
          filename: 'QR-ORD-123-1.png',
          cid: 'qr-1@ecoharmonypark',
          contentType: 'image/png',
          content: Buffer.from('png-qr-1').toString('base64'),
        }),
      ]);
    });

    it('propaga el error si el servidor rechaza el envío', async () => {
      const transportador = nodemailer.createTransport({ jsonTransport: true });
      vi.spyOn(transportador, 'sendMail').mockRejectedValue(new Error('Invalid login'));

      const envio = new TransporteSmtp(transportador).enviar(MENSAJE);

      await expect(envio).rejects.toThrow('Invalid login');
    });
  });
});
