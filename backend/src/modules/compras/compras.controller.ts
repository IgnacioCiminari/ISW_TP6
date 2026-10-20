import type { ComprasService } from './compras.service';
import type { SolicitudCompra } from './compras.types';

export interface RespuestaCompraHttp {
  estado: number;
  cuerpo: unknown;
}

const MENSAJES_DE_REGLA = new Set([
  'Solo los usuarios registrados pueden comprar entradas.',
  'Debe seleccionar una forma de pago.',
  'No se pueden comprar más de 10 entradas.',
  'Debe comprar al menos una entrada.',
  'Supera el máximo de 10 entradas para la fecha seleccionada.',
  'Debe indicar la edad y el tipo de pase de cada visitante.',
  'La fecha de visita no puede ser anterior al día actual.',
  'El parque está cerrado en la fecha seleccionada.',
  'No se pueden comprar entradas con más de un mes de anticipación.',
  'Las entradas para el día actual solo pueden comprarse hasta las 17:30.',
  'El tipo de pase debe ser VIP o REGULAR.',
  'La edad del visitante no es válida.',
]);

const esRegistro = (valor: unknown): valor is Record<string, unknown> =>
  typeof valor === 'object' && valor !== null && !Array.isArray(valor);

const leerFechaLocal = (valor: unknown): Date | undefined => {
  if (typeof valor !== 'string') return undefined;
  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (!coincidencia) return undefined;
  const fecha = new Date(
    Number(coincidencia[1]),
    Number(coincidencia[2]) - 1,
    Number(coincidencia[3]),
  );
  return fecha.getFullYear() === Number(coincidencia[1]) &&
    fecha.getMonth() === Number(coincidencia[2]) - 1 &&
    fecha.getDate() === Number(coincidencia[3])
    ? fecha
    : undefined;
};

const leerSolicitud = (cuerpo: unknown): SolicitudCompra | undefined => {
  if (
    !esRegistro(cuerpo) ||
    typeof cuerpo.email !== 'string' ||
    typeof cuerpo.cantidad !== 'number' ||
    !Number.isInteger(cuerpo.cantidad)
  ) {
    return undefined;
  }
  const fechaVisita = leerFechaLocal(cuerpo.fechaVisita);
  if (
    !fechaVisita ||
    !Array.isArray(cuerpo.visitantes) ||
    (cuerpo.formaPago !== 'EFECTIVO' && cuerpo.formaPago !== 'TARJETA')
  ) {
    return undefined;
  }
  if (
    !cuerpo.visitantes.every(
      (visitante) =>
        esRegistro(visitante) &&
        typeof visitante.edad === 'number' &&
        (visitante.tipoPase === 'VIP' || visitante.tipoPase === 'REGULAR'),
    )
  ) {
    return undefined;
  }
  return {
    email: cuerpo.email,
    fechaVisita,
    cantidad: cuerpo.cantidad,
    visitantes: cuerpo.visitantes as SolicitudCompra['visitantes'],
    formaPago: cuerpo.formaPago,
  };
};

export class CompraController {
  constructor(private readonly comprasService: Pick<ComprasService, 'comprarEntradas'>) {}

  async comprar(cuerpo: unknown): Promise<RespuestaCompraHttp> {
    const solicitud = leerSolicitud(cuerpo);
    if (!solicitud) return { estado: 400, cuerpo: { error: 'Solicitud inválida.' } };

    try {
      return { estado: 201, cuerpo: await this.comprasService.comprarEntradas(solicitud) };
    } catch (error) {
      if (error instanceof Error && MENSAJES_DE_REGLA.has(error.message)) {
        return { estado: 422, cuerpo: { error: error.message } };
      }
      return { estado: 500, cuerpo: { error: 'Error interno.' } };
    }
  }
}
