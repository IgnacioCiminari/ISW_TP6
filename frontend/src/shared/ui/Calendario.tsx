import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useId, useState } from 'react';
import { formatearFecha, mismoDia } from './formato';

interface CalendarioProps {
  valor?: Date;
  hoy: Date;
  alElegir: (fecha: Date) => void;
  /** Por qué no se puede elegir la fecha, o `undefined` si se puede. */
  motivoNoDisponible: (fecha: Date) => string | undefined;
  /** Los días cerrados se tachan; el resto de los no disponibles solo se atenúa. */
  estaCerrado: (fecha: Date) => boolean;
  descripcionId?: string;
}

const DIAS_SEMANA = [
  { corto: 'lu', largo: 'lunes' },
  { corto: 'ma', largo: 'martes' },
  { corto: 'mi', largo: 'miércoles' },
  { corto: 'ju', largo: 'jueves' },
  { corto: 'vi', largo: 'viernes' },
  { corto: 'sá', largo: 'sábado' },
  { corto: 'do', largo: 'domingo' },
];

const nombreMes = (mes: Date) => {
  const nombre = new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(mes);
  return `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} ${mes.getFullYear()}`;
};

const diasDelMes = (mes: Date) =>
  Array.from(
    { length: new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate() },
    (_, i) => new Date(mes.getFullYear(), mes.getMonth(), i + 1),
  );

const primeroDelMes = (fecha: Date) => new Date(fecha.getFullYear(), fecha.getMonth(), 1);
const moverMes = (mes: Date, delta: number) => new Date(mes.getFullYear(), mes.getMonth() + delta, 1);

// La semana arranca el lunes: domingo (0) pasa a la última columna.
const columnaInicial = (mes: Date) => (mes.getDay() + 6) % 7;

export const Calendario = ({ valor, hoy, alElegir, motivoNoDisponible, estaCerrado, descripcionId }: CalendarioProps) => {
  const tituloId = useId();
  const [visible, setVisible] = useState(() => primeroDelMes(valor ?? hoy));

  // Se navega entre el mes actual y los meses que tengan algún día a la venta.
  const hayAnterior = visible > primeroDelMes(hoy);
  const haySiguiente = diasDelMes(moverMes(visible, 1)).some((d) => motivoNoDisponible(d) === undefined);

  return (
    <div role="group" aria-labelledby={tituloId} aria-describedby={descripcionId}>
      <div className="mb-3 flex items-center justify-between">
        <h2 id={tituloId} className="text-lg font-bold text-primario" aria-live="polite">
          {nombreMes(visible)}
        </h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setVisible(moverMes(visible, -1))}
            disabled={!hayAnterior}
            aria-label="Mes anterior"
            className="grid size-11 place-items-center rounded-md text-primario hover:bg-fondo disabled:opacity-30"
          >
            <ChevronLeft aria-hidden className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setVisible(moverMes(visible, 1))}
            disabled={!haySiguiente}
            aria-label="Mes siguiente"
            className="grid size-11 place-items-center rounded-md text-primario hover:bg-fondo disabled:opacity-30"
          >
            <ChevronRight aria-hidden className="size-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {DIAS_SEMANA.map((dia) => (
          <abbr
            key={dia.corto}
            title={dia.largo}
            className="pb-1 text-xs font-bold uppercase tracking-wide text-tinta-suave no-underline"
          >
            {dia.corto}
          </abbr>
        ))}
        {Array.from({ length: columnaInicial(visible) }, (_, i) => (
          <span key={`hueco-${i}`} aria-hidden />
        ))}
        {diasDelMes(visible).map((fecha) => {
          const motivo = motivoNoDisponible(fecha);
          const elegida = valor !== undefined && mismoDia(fecha, valor);
          const esHoy = mismoDia(fecha, hoy);
          const cerrado = estaCerrado(fecha);
          return (
            <button
              key={fecha.getDate()}
              type="button"
              onClick={() => alElegir(fecha)}
              disabled={motivo !== undefined}
              aria-pressed={elegida}
              aria-label={`${formatearFecha(fecha)}${motivo ? `. ${motivo}` : ''}`}
              title={motivo}
              className={[
                'relative flex aspect-square max-h-13 w-full items-center justify-center rounded-md text-base cifras transition-colors duration-150',
                elegida
                  ? 'border-2 border-primario bg-acento font-bold text-tinta'
                  : motivo
                    ? cerrado
                      ? 'text-tinta-suave/45 line-through decoration-1'
                      : 'text-tinta-suave/35'
                    : 'border border-renglon bg-superficie font-bold text-tinta hover:border-secundario hover:bg-fondo',
              ].join(' ')}
            >
              {fecha.getDate()}
              {esHoy && (
                <span
                  aria-hidden
                  className={`absolute bottom-1.5 size-1 rounded-full ${motivo ? 'bg-tinta-suave/45' : 'bg-primario'}`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
