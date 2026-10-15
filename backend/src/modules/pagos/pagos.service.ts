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
      return { formaPago: 'EFECTIVO', estado: 'PENDIENTE_EN_BOLETERIA' };
    }

    if (formaPago !== 'TARJETA') {
      throw new Error('Forma de pago no soportada.');
    }

    const preferencia = await this.pasarela.crearPreferencia(numeroOrden, total);
    return {
      formaPago: 'TARJETA',
      estado: 'REDIRIGIDO_A_MERCADO_PAGO',
      urlRedireccion: preferencia.urlRedireccion,
    };
  }
}
