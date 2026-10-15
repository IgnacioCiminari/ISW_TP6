import type { DependenciasCompras, ResultadoCompra, SolicitudCompra } from './compras.types';

// Valores provisorios: los próximos tests los reemplazan por los que dan los colaboradores.
const NUMERO_ORDEN = 'ORD-0001';
const CANTIDAD_ENTRADAS = 2;
const TOTAL = 25000;

export class ComprasService {
  constructor(private readonly deps: DependenciasCompras) {}

  async comprarEntradas(solicitud: SolicitudCompra): Promise<ResultadoCompra> {
    const pago = await this.deps.pagos.procesarPago(NUMERO_ORDEN, TOTAL, 'TARJETA');

    return {
      numeroOrden: NUMERO_ORDEN,
      cantidadEntradas: CANTIDAD_ENTRADAS,
      fechaVisita: solicitud.fechaVisita,
      total: TOTAL,
      pago,
    };
  }
}
