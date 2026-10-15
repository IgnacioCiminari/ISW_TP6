import type { PasarelaPago, TipoPase } from './pagos.types';

export class PagosService {
    constructor(private readonly pasarela: PasarelaPago) {}

    calcularPrecioEntrada(edad: number, tipoPase: TipoPase): number {
        if (15 < edad && edad < 60) {
            if (tipoPase === 'VIP') {
                return 20000
            } else {
                throw Error("No implementado")
            }
        } else {
            throw Error("No implementado")
        }
    }
}