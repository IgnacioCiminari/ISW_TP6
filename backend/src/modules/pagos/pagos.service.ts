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
    return { formaPago: 'EFECTIVO', estado: 'PENDIENTE_EN_BOLETERIA' };
  }
}
