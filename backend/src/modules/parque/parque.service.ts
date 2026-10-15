
export class ParqueService {
    private static readonly FERIADOS: [number, number][] = [
        [11, 25], // 25 de diciembre (mes 0-indexed)
        [0, 1],   // 1 de enero
    ];

    private esFeriado(fecha: Date): boolean {
        const mes = fecha.getMonth();
        const dia = fecha.getDate();
        return ParqueService.FERIADOS.some(([m, d]) => m === mes && d === dia);
    }

    estaAbierto(fecha: Date): boolean {
        const esLunes = fecha.getDay() === 1;
        return !esLunes && !this.esFeriado(fecha);
    }

    private soloFecha(d: Date): Date {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }

    private calcularLimiteAnticipacion(hoy: Date): Date {
        return new Date(hoy.getFullYear(), hoy.getMonth() + 1, hoy.getDate());
    }

    validarFechaVisita(fechaVisita: Date, ahora: Date = new Date()): void {
        const hoy = this.soloFecha(ahora);
        const visita = this.soloFecha(fechaVisita);
        if (visita < hoy) {
            throw new Error('La fecha de visita no puede ser anterior al día actual.');
        }
        if (!this.estaAbierto(fechaVisita)) {
            throw new Error('El parque está cerrado en la fecha seleccionada.');
        }
        if (visita > this.calcularLimiteAnticipacion(hoy)) {
        throw new Error('No se pueden comprar entradas con más de un mes de anticipación.');
        }
    }
}