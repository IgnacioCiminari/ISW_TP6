export type TipoPase = 'REGULAR' | 'VIP';

export type FormaPago = 'TARJETA' | 'EFECTIVO';

export interface Visitante {
  edad: number;
  tipoPase: TipoPase;
}
