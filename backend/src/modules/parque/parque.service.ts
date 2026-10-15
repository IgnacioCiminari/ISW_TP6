
export class ParqueService {
    estaAbierto(fecha: Date): boolean {
        if (fecha.getDay() === 1) return false;
        if (fecha.getMonth() === 11 && fecha.getDate() === 25) return false; // 25 dic
        return true;
    }
}