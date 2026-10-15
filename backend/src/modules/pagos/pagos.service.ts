import type {
  DetallePrecio,
  FormaPago,
  PasarelaPago,
  ResultadoPago,
  TipoPase,
  Visitante,
} from './pagos.types';

export class PagosService {
  constructor(private readonly pasarela: PasarelaPago) { }

  async procesarPago(
    numeroOrden: string,
    total: number,
    formaPago: FormaPago,
  ): Promise<ResultadoPago> {
    if (formaPago === 'EFECTIVO') {
      return { formaPago, estado: 'PENDIENTE_EN_BOLETERIA' };
    }

    if (formaPago === 'TARJETA') {
      return this.iniciarPagoConMercadoPago(numeroOrden, total);
    }

    throw new Error('Forma de pago no soportada.');
  }

  private async iniciarPagoConMercadoPago(
    numeroOrden: string,
    total: number,
  ): Promise<ResultadoPago> {
    try {
      const preferencia = await this.pasarela.crearPreferencia(numeroOrden, total);
      return {
        formaPago: 'TARJETA',
        estado: 'REDIRIGIDO_A_MERCADO_PAGO',
        urlRedireccion: preferencia.urlRedireccion,
      };
    } catch {
      throw new Error('No se pudo iniciar el pago con Mercado Pago.');
    }
  }
}
