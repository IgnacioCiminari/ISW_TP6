import type { MensajeMail, TransporteMail } from '../../src/modules/compras/compras.mail.types';

export class TransporteMailFalso implements TransporteMail {
  enviados: MensajeMail[] = [];

  // Con un error, simula que el servidor de mail rechaza el envío.
  constructor(private readonly error?: Error) {}

  async enviar(mensaje: MensajeMail): Promise<void> {
    if (this.error) throw this.error;
    this.enviados.push(mensaje);
  }
}
