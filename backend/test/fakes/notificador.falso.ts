import type { DependenciasCompras, ResumenCompra } from '../../src/modules/compras/compras.types';

type Notificador = DependenciasCompras['notificador'];

export class NotificadorFalso implements Notificador {
  llamadas: { email: string; resumen: ResumenCompra }[] = [];

  async enviarConfirmacion(email: string, resumen: ResumenCompra): Promise<void> {
    this.llamadas.push({ email, resumen });
  }
}
