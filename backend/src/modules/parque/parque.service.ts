type ParteFecha = 'year' | 'month' | 'day' | 'hour' | 'minute';

export class ParqueService {
  private static readonly FERIADOS: [number, number][] = [
    [11, 25],
    [0, 1],
  ];

  private static readonly DIA_LUNES = 1; // getDay(): 0 domingo … 6 sábado
  private static readonly MESES_ANTICIPACION = 1;
  private static readonly HORA_LIMITE = 17;
  private static readonly MINUTO_LIMITE = 30;

  // Las reglas horarias se evalúan en hora de Córdoba, sin importar la zona del proceso.
  private static readonly ZONA_HORARIA = 'America/Argentina/Cordoba';
  private static readonly FORMATO_CORDOBA = new Intl.DateTimeFormat('es-AR', {
    timeZone: ParqueService.ZONA_HORARIA,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  });

  estaAbierto(fecha: Date): boolean {
    const esLunes = fecha.getDay() === ParqueService.DIA_LUNES;
    return !esLunes && !this.esFeriado(fecha);
  }

  validarFechaVisita(fechaVisita: Date, ahora: Date = new Date()): void {
    const hoy = this.fechaEnCordoba(ahora);
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

    if (visita.getTime() === hoy.getTime() && this.esCompraTardiaParaHoy(ahora)) {
      throw new Error('Las entradas para el día actual solo pueden comprarse hasta las 17:30.');
    }
  }

  private esFeriado(fecha: Date): boolean {
    const mes = fecha.getMonth();
    const dia = fecha.getDate();

    return ParqueService.FERIADOS.some(([m, d]) => m === mes && d === dia);
  }

  private soloFecha(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  /** Año, mes (1-12), día, hora y minuto de un instante en hora de Córdoba. */
  private partesEnCordoba(instante: Date): Record<ParteFecha, number> {
    const partes = ParqueService.FORMATO_CORDOBA.formatToParts(instante);
    const leer = (tipo: ParteFecha): number =>
      Number(partes.find((parte) => parte.type === tipo)?.value);

    return {
      year: leer('year'),
      month: leer('month'),
      day: leer('day'),
      hour: leer('hour'),
      minute: leer('minute'),
    };
  }

  private fechaEnCordoba(ahora: Date): Date {
    const { year, month, day } = this.partesEnCordoba(ahora);
    return new Date(year, month - 1, day);
  }

  private calcularLimiteAnticipacion(hoy: Date): Date {
    return new Date(
      hoy.getFullYear(),
      hoy.getMonth() + ParqueService.MESES_ANTICIPACION,
      hoy.getDate(),
    );
  }

  private esCompraTardiaParaHoy(ahora: Date): boolean {
    const { hour: hora, minute: minuto } = this.partesEnCordoba(ahora);

    return (
      hora > ParqueService.HORA_LIMITE ||
      (hora === ParqueService.HORA_LIMITE && minuto > ParqueService.MINUTO_LIMITE)
    );
  }
}
