import type { PasarelaPago, TipoPase } from './pagos.types';
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

    calcularPrecioEntrada(edad: number, tipoPase: TipoPase): number {

        if (edad >= 0 && edad <= EDAD_MAX_NINOS_GRATIS) {
            return PRECIO_ENTRADA_GRATIS
        }

        if (edad <= EDAD_MAX_MENORES_DESCUENTO) {
            if (tipoPase === 'REGULAR') {
                return PRECIO_ENTRADA_POR_PASE.REGULAR * FACTOR_DESCUENTO_MEDIA_ENTRADA
            } else {
                return PRECIO_ENTRADA_POR_PASE.VIP * FACTOR_DESCUENTO_MEDIA_ENTRADA
            }
        }

        if (EDAD_MAX_MENORES_DESCUENTO < edad && edad < EDAD_MIN_JUBILADOS_DESCUENTO) {
            if (tipoPase === 'VIP') {
                return PRECIO_ENTRADA_POR_PASE.VIP
            } else {
                return PRECIO_ENTRADA_POR_PASE.REGULAR
            }
        } else {
            if (tipoPase === 'VIP') {
                return PRECIO_ENTRADA_POR_PASE.VIP * FACTOR_DESCUENTO_MEDIA_ENTRADA
            } else {
                return PRECIO_ENTRADA_POR_PASE.REGULAR * FACTOR_DESCUENTO_MEDIA_ENTRADA
            }
        }
    }
}
