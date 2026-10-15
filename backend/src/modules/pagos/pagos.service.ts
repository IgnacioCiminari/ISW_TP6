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
        const precioBase = PRECIO_ENTRADA_POR_PASE[tipoPase]

        if (edad < 0) {
            throw Error('La edad del visitante no es válida.')
        }

        if (edad <= EDAD_MAX_NINOS_GRATIS) {
            return PRECIO_ENTRADA_GRATIS
        }

        const pagaMediaEntrada =
            edad <= EDAD_MAX_MENORES_DESCUENTO || edad >= EDAD_MIN_JUBILADOS_DESCUENTO
        if (pagaMediaEntrada) {
            return precioBase * FACTOR_DESCUENTO_MEDIA_ENTRADA
        }

        return precioBase
    }
}
