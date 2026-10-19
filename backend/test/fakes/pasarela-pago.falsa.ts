import type { PasarelaPago, PreferenciaPago } from '../../src/modules/pagos/pagos.types';

export class PasarelaPagoFalsa implements PasarelaPago {
  llamadas: { numeroOrden: string; total: number }[] = [];

  constructor(private readonly preferencia: PreferenciaPago) {}

  async crearPreferencia(numeroOrden: string, total: number): Promise<PreferenciaPago> {
    this.llamadas.push({ numeroOrden, total });
    return this.preferencia;
  }
}
