import type {
  DetallePrecio,
  FormaPago,
  PasarelaPago,
  ResultadoPago,
  Subtotal,
  TipoPase,
  Visitante,
} from './pagos.types';

import {
  PRECIO_ENTRADA_POR_PASE,
  PRECIO_ENTRADA_GRATIS,
  EDAD_MAX_NINOS_GRATIS,
  EDAD_MAX_MENORES_DESCUENTO,
  EDAD_MIN_JUBILADOS_DESCUENTO,
  FACTOR_DESCUENTO_MEDIA_ENTRADA,
} from './pagos.constants';

export class PagosService {
  constructor(private readonly pasarela: PasarelaPago) {}

  calcularPrecioEntrada(
    edad: number,
    tipoPase: TipoPase,
  ): number {
    if (!Object.hasOwn(PRECIO_ENTRADA_POR_PASE, tipoPase)) {
      throw new Error('El tipo de pase debe ser VIP o REGULAR.');
    }

    const precioBase = PRECIO_ENTRADA_POR_PASE[tipoPase];

    if (edad < 0) {
      throw new Error('La edad del visitante no es válida.');
    }

    if (edad <= EDAD_MAX_NINOS_GRATIS) {
      return PRECIO_ENTRADA_GRATIS;
    }

    const pagaMediaEntrada =
      edad <= EDAD_MAX_MENORES_DESCUENTO ||
      edad >= EDAD_MIN_JUBILADOS_DESCUENTO;

    if (pagaMediaEntrada) {
      return precioBase * FACTOR_DESCUENTO_MEDIA_ENTRADA;
    }

    return precioBase;
  }

  calcularDetalle(visitantes: Visitante[]): DetallePrecio {
    const subtotales: Subtotal[] = [];
    let precioTotal = 0;

    for (const visitante of visitantes) {
      const precioVisitante = this.calcularPrecioEntrada(
        visitante.edad,
        visitante.tipoPase,
      );

      precioTotal += precioVisitante;

      const subtotal: Subtotal = {
        ...visitante,
        precio: precioVisitante,
      };

      subtotales.push(subtotal);
    }

    return {
      subtotales,
      total: precioTotal,
    };
  }

  async procesarPago(
    numeroOrden: string,
    total: number,
    formaPago: FormaPago,
  ): Promise<ResultadoPago> {
    if (formaPago === 'EFECTIVO') {
      return {
        formaPago,
        estado: 'PENDIENTE_EN_BOLETERIA',
      };
    }

    if (formaPago === 'TARJETA') {
      return this.iniciarPagoConMercadoPago(numeroOrden, total);
    }

    throw new Error('Forma de pago no soportada.');
  }

  private async iniciarPagoConMercadoPago(
    numeroOrden: string,
    total: number,
  ): Promise<ResultadoPago> {
    try {
      const preferencia = await this.pasarela.crearPreferencia(
        numeroOrden,
        total,
      );

      return {
        formaPago: 'TARJETA',
        estado: 'REDIRIGIDO_A_MERCADO_PAGO',
        urlRedireccion: preferencia.urlRedireccion,
      };
    } catch {
      throw new Error('No se pudo iniciar el pago con Mercado Pago.');
    }
  }
}