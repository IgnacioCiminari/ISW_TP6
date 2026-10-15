import type { PasarelaPago, TipoPase } from './pagos.types';

export class PagosService {
    constructor(private readonly pasarela: PasarelaPago) {}

    calcularPrecioEntrada(edad: number, tipoPase: TipoPase): number {

        if (edad >= 0 && edad <= 3) {
            return 0
        }

        if (tipoPase === 'VIP' && edad <= 15) {
            return 10000
        }

        if (15 < edad && edad < 60) {
            if (tipoPase === 'VIP') {
                return 20000
            } else {
                return 10000
            }
        } else {
            throw Error("No implementado")
        }
    }
}