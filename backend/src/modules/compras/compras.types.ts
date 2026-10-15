import type { FormaPago, Visitante } from '../pagos/pagos.types';

export interface SolicitudCompra {
  email: string;
  fechaVisita: Date;
  cantidad: number;
  visitantes: Visitante[];
  formaPago: FormaPago;
}

// Colaboradores inyectados por constructor. Se agregan a medida que los tests los piden.
export interface DependenciasCompras {}
