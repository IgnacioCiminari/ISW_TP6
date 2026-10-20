import { Check } from 'lucide-react';
import { PASOS, type PasoCompra } from '../useCompra';

const NOMBRES: Record<PasoCompra, string> = {
  fecha: 'Fecha',
  visitantes: 'Visitantes',
  pago: 'Pago',
};

interface GuiaPasosProps {
  paso: PasoCompra;
  pasoMaximo: number;
  irAPaso: (paso: PasoCompra) => void;
}

// Palabras guía: los tres pasos siempre nombrados, el actual marcado y los hechos con tilde.
export const GuiaPasos = ({ paso, pasoMaximo, irAPaso }: GuiaPasosProps) => {
  const actual = PASOS.indexOf(paso);
  return (
    <nav aria-label="Pasos de la compra" className="border-b border-primario/20">
      <ol className="flex">
        {PASOS.map((p, i) => {
          const esActual = i === actual;
          const hecho = i < pasoMaximo && !esActual;
          const alcanzable = i <= pasoMaximo && !esActual;
          return (
            <li key={p} className="flex-1">
              <button
                type="button"
                onClick={() => irAPaso(p)}
                disabled={!alcanzable}
                aria-current={esActual ? 'step' : undefined}
                className={[
                  'relative flex h-12 w-full items-center gap-1.5 text-[15px] disabled:cursor-default',
                  i === 0 ? 'justify-start' : i === PASOS.length - 1 ? 'justify-end' : 'justify-center',
                  esActual ? 'font-bold text-primario' : hecho ? 'text-tinta hover:text-primario' : 'text-tinta-suave',
                ].join(' ')}
              >
                {hecho ? (
                  <Check aria-hidden className="size-4 text-secundario" strokeWidth={3} />
                ) : (
                  <span aria-hidden className="cifras text-[13px]">
                    {i + 1}
                  </span>
                )}
                {NOMBRES[p]}
                {hecho && <span className="sr-only"> (completo)</span>}
                {esActual && <span aria-hidden className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-primario" />}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
