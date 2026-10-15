export type TipoPase = 'REGULAR' | 'VIP';

export type FormaPago = 'TARJETA' | 'EFECTIVO';

export interface Visitante {
  edad: number;
  tipoPase: TipoPase;
}

export type ResultadoPago =
  | { formaPago: 'TARJETA'; estado: 'REDIRIGIDO_A_MERCADO_PAGO'; urlRedireccion: string }
  | { formaPago: 'EFECTIVO'; estado: 'PENDIENTE_EN_BOLETERIA' };
