import type { Transporter } from 'nodemailer';
import type { MensajeMail, TransporteMail } from './compras.mail.types';

// Recibe el transportador de nodemailer ya configurado: SMTP en producción,
// jsonTransport en los tests.
export class TransporteSmtp implements TransporteMail {
  constructor(private readonly transportador: Transporter) {}

  async enviar(mensaje: MensajeMail): Promise<void> {
    await this.transportador.sendMail({
      from: mensaje.de,
      to: mensaje.para,
      subject: mensaje.asunto,
      html: mensaje.html,
      text: mensaje.texto,
      attachments: mensaje.adjuntos.map((adjunto) => ({
        filename: adjunto.nombre,
        content: adjunto.contenido,
        cid: adjunto.cid,
        contentType: 'image/png',
      })),
    });
  }
}
