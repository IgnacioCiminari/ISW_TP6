import type { DependenciasCompras, ResultadoCompra, SolicitudCompra } from './compras.types';

export class ComprasService {
  constructor(private readonly deps: DependenciasCompras) {}

  async comprarEntradas(solicitud: SolicitudCompra): Promise<ResultadoCompra> {
    return {
      numeroOrden: 'ORD-0001',
      cantidadEntradas: 2,
      fechaVisita: new Date(2026, 9, 15),
      total: 25000,
    };
  }
}
