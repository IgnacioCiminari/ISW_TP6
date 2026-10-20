import { Check } from 'lucide-react';
import { PASOS, type PasoCompra } from '../useCompra';

const NOMBRES: Record<PasoCompra, string> = {
  fecha: 'Fecha',
  visitantes: 'Visitantes',
  pago: 'Pago',
};

// Guía de pasos: solo informa. Se avanza con «Continuar» y se vuelve con «Anterior».
export const GuiaPasos = ({ paso }: { paso: PasoCompra }) => {
  const actual = PASOS.indexOf(paso);
  return (
    <nav aria-label="Pasos de la compra" className="pb-2 pt-4">
      <ol className="flex items-start">
        {PASOS.map((p, i) => {
          const esActual = i === actual;
          const hecho = i < actual;
          return (
            <li
              key={p}
              className="flex flex-1 items-start last:flex-none"
              aria-current={esActual ? 'step' : undefined}
            >
              <div className="flex flex-col items-center gap-1.5">
                <span
                  aria-hidden
                  className={[
                    'grid size-8 place-items-center rounded-full border-2 text-[13px] font-bold transition-colors duration-500 cifras',
                    hecho
                      ? 'border-primario bg-primario text-superficie'
                      : esActual
                        ? 'border-primario bg-superficie text-primario'
                        : 'border-tinta-suave/40 bg-fondo text-tinta-suave',
                  ].join(' ')}
                >
                  {hecho ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={`text-[15px] ${esActual ? 'font-bold text-primario' : hecho ? 'text-tinta' : 'text-tinta-suave'}`}
                >
                  {NOMBRES[p]}
                  {hecho && <span className="sr-only"> (completo)</span>}
                </span>
              </div>
              {/* El camino hasta el paso actual se pinta entero; la bola actual queda sin pintar. */}
              {i < PASOS.length - 1 && (
                <span
                  aria-hidden
                  className="relative mx-2 mt-[14px] h-1 flex-1 overflow-hidden rounded-full bg-tinta-suave/20"
                >
                  <span
                    className={`absolute inset-0 origin-left rounded-full bg-primario transition-transform duration-[900ms] ease-in-out motion-reduce:transition-none ${i + 1 <= actual ? 'scale-x-100' : 'scale-x-0'}`}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
