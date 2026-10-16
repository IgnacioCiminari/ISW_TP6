import type { FormaPago, ResultadoPago, Visitante } from '../pagos/pagos.types';
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
    await this.validarCantidadEntradas(solicitud);
    this.validarVisitantes(solicitud.cantidad, solicitud.visitantes);
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

  private async validarCantidadEntradas(solicitud: SolicitudCompra): Promise<void> { 
    if (solicitud.cantidad > MAX_ENTRADAS) {
      throw new Error('No se pueden comprar más de 10 entradas.')
    }
    if (solicitud.cantidad === 0){
      throw new Error('Debe comprar al menos una entrada.');
    }

    const comprasAnteriores = await this.deps.compras.contarEntradas(solicitud.email,solicitud.fechaVisita);
    if (( comprasAnteriores + solicitud.cantidad) > MAX_ENTRADAS) {
      throw new Error('Supera el máximo de 10 entradas para la fecha seleccionada.');
    }
  }

  private validarVisitantes(cantidad: number, visitantes: Visitante[]): void {
    if (visitantes.length !== cantidad) {
      throw new Error('Debe indicar la edad y el tipo de pase de cada visitante.');
    }
    for (const visitante of visitantes) {
      if (
        visitante.edad < 0 ||
        !Number.isFinite(visitante.edad) ||
        visitante.edad === undefined ||
        visitante.tipoPase === undefined
      ) {
        throw new Error('Debe indicar la edad y el tipo de pase de cada visitante.');
      }
    }
  }

  private registrarCompra(compra: NuevaCompra): Promise<string> {
    return this.deps.compras.guardar(compra);
  }

  private async iniciarPago(
    numeroOrden: string,
    total: number,
    formaPago: FormaPago,
  ): Promise<ResultadoPago> {
    try {
    return await this.deps.pagos.procesarPago(numeroOrden, total, formaPago);
    } 
    catch(error){
      throw new Error('No se pudo iniciar el pago con Mercado Pago.');
    };
    
  }

  private notificarCompra(email: string, resumen: ResumenCompra): Promise<void> {
    return this.deps.notificador.enviarConfirmacion(email, resumen);
  }

  private generarCodigoQR(numeroOrden: string): string {
    return `${PREFIJO_QR}${numeroOrden}`;
  }
 
}

