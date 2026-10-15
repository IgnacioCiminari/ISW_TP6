import type { PasarelaPago, TipoPase } from './pagos.types';

export class PagosService {
    constructor(private readonly pasarela: PasarelaPago) {}

    calcularPrecioEntrada(edad: number, tipoPase: TipoPase): number {
        throw new Error("No implementado")
    }
}