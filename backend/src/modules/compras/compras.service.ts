import type { FormaPago, ResultadoPago } from '../pagos/pagos.types';
import type {
  DependenciasCompras,
  NuevaCompra,
  ResultadoCompra,
  ResumenCompra,
  SolicitudCompra,
} from './compras.types';

const PREFIJO_QR = 'QR-';

export class ComprasService {
  constructor(private readonly deps: DependenciasCompras) {}

  async comprarEntradas(solicitud: SolicitudCompra): Promise<ResultadoCompra> {
    this.validarSolicitud(solicitud);

    const { email, fechaVisita, cantidad, visitantes, formaPago } = solicitud;
    const detalle = this.deps.pagos.calcularDetalle(visitantes);
    const numeroOrden = await this.registrarCompra({
      email,
      fechaVisita,
      visitantes,
      formaPago,
      detalle,
    });
    const pago = await this.iniciarPago(numeroOrden, detalle.total, formaPago);
    await this.notificarCompra(email, {
      numeroOrden,
      fechaVisita,
      cantidadEntradas: cantidad,
      formaPago,
      detalle,
      codigoQR: this.generarCodigoQR(numeroOrden),
    });

    return {
      numeroOrden,
      cantidadEntradas: cantidad,
      fechaVisita,
      total: detalle.total,
      pago,
    };
  }

  private validarSolicitud(solicitud: SolicitudCompra): void {
    this.deps.parque.validarFechaVisita(solicitud.fechaVisita);
  }

  private registrarCompra(compra: NuevaCompra): Promise<string> {
    return this.deps.compras.guardar(compra);
  }

  private iniciarPago(
    numeroOrden: string,
    total: number,
    formaPago: FormaPago,
  ): Promise<ResultadoPago> {
    return this.deps.pagos.procesarPago(numeroOrden, total, formaPago);
  }

  private notificarCompra(email: string, resumen: ResumenCompra): Promise<void> {
    return this.deps.notificador.enviarConfirmacion(email, resumen);
  }

  private generarCodigoQR(numeroOrden: string): string {
    return `${PREFIJO_QR}${numeroOrden}`;
  }
}
