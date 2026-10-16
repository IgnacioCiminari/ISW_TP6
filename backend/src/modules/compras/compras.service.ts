import type { FormaPago, ResultadoPago } from '../pagos/pagos.types';
import type {
  DependenciasCompras,
  NuevaCompra,
  ResultadoCompra,
  ResumenCompra,
  SolicitudCompra,
} from './compras.types';

const PREFIJO_QR = 'QR-';
const MAX_ENTRADAS = 10;

export class ComprasService {
  constructor(private readonly deps: DependenciasCompras) {}

  async comprarEntradas(solicitud: SolicitudCompra): Promise<ResultadoCompra> {
    await this.validarSolicitud(solicitud);

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

  private async validarSolicitud(solicitud: SolicitudCompra): Promise<void> {
    this.deps.parque.validarFechaVisita(solicitud.fechaVisita);
    await this.validarUsuarioRegistrado(solicitud.email);
    this.validarSeleccionPago(solicitud.formaPago);
    this.validarCantidadEntradas(solicitud.cantidad);

  }

  private async validarUsuarioRegistrado(email: string): Promise<void> {
    const registrado = await this.deps.usuarios.estaRegistrado(email);
    if (!registrado) {
    throw new Error('Solo los usuarios registrados pueden comprar entradas.');
    }
  }

  private validarSeleccionPago(formaPago: FormaPago): void {
    if (formaPago === undefined) {
      throw new Error('Debe seleccionar una forma de pago.');
    }
  }

  private validarCantidadEntradas(cantidad: number): void { 
    if (cantidad > MAX_ENTRADAS) {
      throw new Error('No se pueden comprar más de 10 entradas.')
    }
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

