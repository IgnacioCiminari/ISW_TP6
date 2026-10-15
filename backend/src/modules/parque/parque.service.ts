
export class ParqueService {
    private esFeriado(fecha: Date): boolean {
        const mes = fecha.getMonth();
        const dia = fecha.getDate();
        return (mes === 11 && dia === 25) || (mes === 0 && dia === 1);
    }

    estaAbierto(fecha: Date): boolean {
        if (fecha.getDay() === 1) return false;
        if (this.esFeriado(fecha)) return false;
        return true;
    }
}