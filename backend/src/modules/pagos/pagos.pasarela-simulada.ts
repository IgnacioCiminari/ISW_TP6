import type { PasarelaPago, PreferenciaPago } from './pagos.types';

export class PasarelaPagoSimulada implements PasarelaPago {
  constructor(private readonly urlRedireccion: string) {}

  async crearPreferencia(numeroOrden: string, _total: number): Promise<PreferenciaPago> {
    return { id: `PREF-${numeroOrden}`, urlRedireccion: this.urlRedireccion };
  }
}
