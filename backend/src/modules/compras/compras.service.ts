import type { FormaPago, ResultadoPago } from '../pagos/pagos.types';
import type { DependenciasCompras, ResultadoCompra, SolicitudCompra } from './compras.types';

// Valores provisorios: los próximos tests los reemplazan por los que dan los colaboradores.
const NUMERO_ORDEN = 'ORD-0001';
const CANTIDAD_ENTRADAS = 2;
const TOTAL = 25000;

export class ComprasService {
  constructor(private readonly deps: DependenciasCompras) {}

  async comprarEntradas(solicitud: SolicitudCompra): Promise<ResultadoCompra> {
    const { email, fechaVisita, visitantes, formaPago } = solicitud;
    const detalle = this.deps.pagos.calcularDetalle(visitantes);
    await this.deps.compras.guardar({ email, fechaVisita, visitantes, formaPago, detalle });
    const pago = await this.iniciarPago(NUMERO_ORDEN, TOTAL, formaPago);

    return {
      numeroOrden: NUMERO_ORDEN,
      cantidadEntradas: CANTIDAD_ENTRADAS,
      fechaVisita,
      total: TOTAL,
      pago,
    };
  }

  private iniciarPago(
    numeroOrden: string,
    total: number,
    formaPago: FormaPago,
  ): Promise<ResultadoPago> {
    return this.deps.pagos.procesarPago(numeroOrden, total, formaPago);
  }
}
