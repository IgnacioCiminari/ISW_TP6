export type TipoPase = 'REGULAR' | 'VIP';

export type FormaPago = 'TARJETA' | 'EFECTIVO';

export interface Visitante {
  edad: number;
  tipoPase: TipoPase;
}

export interface SubtotalVisitante {
  edad: number;
  tipoPase: TipoPase;
  precio: number;
}

export interface DetallePrecio {
  subtotales: SubtotalVisitante[];
  total: number;
}

export type ResultadoPago =
  | { formaPago: 'TARJETA'; estado: 'REDIRIGIDO_A_MERCADO_PAGO'; urlRedireccion: string }
  | { formaPago: 'EFECTIVO'; estado: 'PENDIENTE_EN_BOLETERIA' };
