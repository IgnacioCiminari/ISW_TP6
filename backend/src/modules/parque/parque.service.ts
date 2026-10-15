
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

    validarFechaVisita(fechaVisita: Date, ahora: Date = new Date()): void {
        throw new Error('No implementado');
    } 
}