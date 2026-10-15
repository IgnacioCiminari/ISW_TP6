import type { DependenciasCompras, SolicitudCompra } from './compras.types';

export class ComprasService {
  constructor(private readonly deps: DependenciasCompras) {}

  async comprarEntradas(solicitud: SolicitudCompra): Promise<void> {}
}
