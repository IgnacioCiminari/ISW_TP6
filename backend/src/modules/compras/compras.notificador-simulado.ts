import type { DependenciasCompras, ResumenCompra } from './compras.types';

type Notificador = DependenciasCompras['notificador'];

export class NotificadorSimulado implements Notificador {
  async enviarConfirmacion(_email: string, _resumen: ResumenCompra): Promise<void> {}
}
