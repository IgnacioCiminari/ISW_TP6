
export class ParqueService {
    private static readonly LUNES = 1;
    
    estaAbierto(fecha: Date): boolean {
        return fecha.getDay() !== ParqueService.LUNES;
    }
}