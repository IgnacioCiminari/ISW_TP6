
export class ParqueService {
    estaAbierto(fecha: Date): boolean {
        const dia = fecha.getDay(); // 0=dom, 1=lun, ..., 6=sáb
        if (dia === 1) return false; // lunes cerrado
        return true;
    }
}