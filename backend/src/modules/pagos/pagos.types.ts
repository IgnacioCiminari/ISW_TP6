export type TipoPase = 'REGULAR' | 'VIP';

export type FormaPago = 'TARJETA' | 'EFECTIVO';

export interface Visitante {
  edad: number;
  tipoPase: TipoPase;
}

export interface ResultadoPago {
  formaPago: FormaPago;
  estado: 'REDIRIGIDO_A_MERCADO_PAGO';
  urlRedireccion: string;
}
