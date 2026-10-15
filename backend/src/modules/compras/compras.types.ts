import type { DetallePrecio, FormaPago, ResultadoPago, Visitante } from '../pagos/pagos.types';

export interface SolicitudCompra {
  email: string;
  fechaVisita: Date;
  cantidad: number;
  visitantes: Visitante[];
  formaPago: FormaPago;
}

export interface NuevaCompra {
  email: string;
  fechaVisita: Date;
  visitantes: Visitante[];
  formaPago: FormaPago;
  detalle: DetallePrecio;
}

export interface ResumenCompra {
  numeroOrden: string;
  fechaVisita: Date;
  cantidadEntradas: number;
  formaPago: FormaPago;
  detalle: DetallePrecio;
  codigoQR: string;
}

export interface ResultadoCompra {
  numeroOrden: string;
  cantidadEntradas: number;
  fechaVisita: Date;
  total: number;
  pago: ResultadoPago;
}

// Colaboradores inyectados por constructor. Se agregan a medida que los tests los piden.
export interface DependenciasCompras {
  parque: {
    validarFechaVisita(fechaVisita: Date, ahora?: Date): void;
  };
  pagos: {
    calcularDetalle(visitantes: Visitante[]): DetallePrecio;
    procesarPago(numeroOrden: string, total: number, formaPago: FormaPago): Promise<ResultadoPago>;
  };
  compras: {
    guardar(compra: NuevaCompra): Promise<string>;
  };
  notificador: {
    enviarConfirmacion(email: string, resumen: ResumenCompra): Promise<void>;
  };
}
