import type {
  DetallePrecio,
  FormaPago,
  ResultadoPago,
  Subtotal,
  Visitante,
} from '../pagos/pagos.types';

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

// Cada entrada lleva su propio QR de acceso.
export interface EntradaConfirmada extends Subtotal {
  codigoQR: string;
}

export interface ResumenCompra {
  numeroOrden: string;
  fechaVisita: Date;
  cantidadEntradas: number;
  formaPago: FormaPago;
  detalle: DetallePrecio;
  entradas: EntradaConfirmada[];
}

export interface ResultadoCompra {
  numeroOrden: string;
  cantidadEntradas: number;
  fechaVisita: Date;
  total: number;
  pago: ResultadoPago;
}

// Imagen embebida en el HTML: el cuerpo la referencia con `<img src="cid:...">`.
export interface AdjuntoMail {
  nombre: string;
  contenido: Buffer;
  cid: string;
}

export interface MensajeMail {
  de: string;
  para: string;
  asunto: string;
  html: string;
  texto: string;
  adjuntos: AdjuntoMail[];
}

// Puerto hacia el servidor de mail: en los tests se reemplaza por un fake,
// en producción se implementa con SMTP.
export interface TransporteMail {
  enviar(mensaje: MensajeMail): Promise<void>;
}

// Colaboradores inyectados por constructor. Se agregan a medida que los tests los piden.
export interface DependenciasCompras {
  usuarios: {
    estaRegistrado(email: string): Promise<boolean>;
  };
  parque: {
    validarFechaVisita(fechaVisita: Date, ahora?: Date): void;
  };
  pagos: {
    calcularDetalle(visitantes: Visitante[]): DetallePrecio;
    procesarPago(numeroOrden: string, total: number, formaPago: FormaPago): Promise<ResultadoPago>;
  };
  compras: {
    contarEntradas(email: string, fecha: Date): Promise<number>;
    guardar(compra: NuevaCompra): Promise<string>;
  };
  notificador: {
    enviarConfirmacion(email: string, resumen: ResumenCompra): Promise<void>;
  };
}
