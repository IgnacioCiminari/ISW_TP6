import { armarMailConfirmacion } from './compras.mail-confirmacion';
import { generarImagenQR } from './compras.qr';
import type { TransporteMail } from './compras.mail.types';
import type { DependenciasCompras, ResumenCompra } from './compras.types';

type Notificador = DependenciasCompras['notificador'];

export class NotificadorMail implements Notificador {
  constructor(
    private readonly transporte: TransporteMail,
    private readonly remitente: string,
  ) {}

  async enviarConfirmacion(email: string, resumen: ResumenCompra): Promise<void> {
    const imagenesQR = await Promise.all(
      resumen.entradas.map((entrada) => generarImagenQR(entrada.codigoQR)),
    );

    await this.transporte.enviar(
      armarMailConfirmacion({ remitente: this.remitente, para: email, resumen, imagenesQR }),
    );
  }
}
