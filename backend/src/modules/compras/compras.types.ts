import type { FormaPago, Visitante } from '../pagos/pagos.types';

export interface SolicitudCompra {
  email: string;
  fechaVisita: Date;
  cantidad: number;
  visitantes: Visitante[];
  formaPago: FormaPago;
}

export interface ResultadoCompra {
  numeroOrden: string;
  cantidadEntradas: number;
  fechaVisita: Date;
  total: number;
}

// Colaboradores inyectados por constructor. Se agregan a medida que los tests los piden.
export interface DependenciasCompras {}
