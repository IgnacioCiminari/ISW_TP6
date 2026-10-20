import { Plus, Trash2 } from 'lucide-react';
import { Boton } from '../../../shared/ui/Boton';
import { MensajeCampo } from '../../../shared/ui/Alerta';
import {
  EDAD_MAX_MENORES_DESCUENTO,
  EDAD_MAX_NINOS_GRATIS,
  EDAD_MIN_JUBILADOS_DESCUENTO,
  FACTOR_DESCUENTO_MEDIA_ENTRADA,
  PRECIO_ENTRADA_POR_PASE,
} from '@backend/modules/pagos/pagos.constants';
import type { TipoPase } from '@backend/modules/pagos/pagos.types';
import { formatearPesos } from '../../../shared/ui/formato';
import type { ErroresVisitante, EstadoCompra, VisitanteFormulario } from '../useCompra';
import { EncabezadoPaso } from './PasoFecha';

const PASES: { valor: TipoPase; nombre: string }[] = [
  { valor: 'REGULAR', nombre: 'Regular' },
  { valor: 'VIP', nombre: 'VIP' },
];

const PORCENTAJE_DESCUENTO = Math.round((1 - FACTOR_DESCUENTO_MEDIA_ENTRADA) * 100);

// Descuento aplicado, deducido del precio que calculó el backend frente al precio completo del pase.
const descripcionDescuento = (precio: number | undefined, tipoPase: TipoPase | undefined) => {
  if (precio === undefined || !tipoPase) return undefined;
  const completo = PRECIO_ENTRADA_POR_PASE[tipoPase];
  if (precio === completo) return undefined;
  return precio === 0
    ? 'Sin cargo por edad'
    : `${Math.round((1 - precio / completo) * 100)} % de descuento por edad`;
};

export const PasoVisitantes = ({ compra }: { compra: EstadoCompra }) => {
  const cantidad = compra.visitantes.length;

  return (
    <>
      <EncabezadoPaso titulo="¿Quiénes vienen?">Edad y pase de cada visitante.</EncabezadoPaso>

      <ol className="rounded-md bg-superficie px-4 sm:px-5">
        {compra.visitantes.map((visitante, i) => (
          <FilaVisitante
            key={visitante.id}
            numero={i + 1}
            visitante={visitante}
            precio={compra.subtotales[i]?.precio}
            errores={
              compra.mostrarErroresVisitantes
                ? compra.erroresVisitantes.get(visitante.id)
                : undefined
            }
            puedeQuitar={cantidad > 1}
            alCambiar={(cambios) => compra.actualizarVisitante(visitante.id, cambios)}
            alQuitar={() => compra.quitarVisitante(visitante.id)}
          />
        ))}
      </ol>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <Boton variante="secundario" onClick={compra.agregarVisitante}>
          <Plus aria-hidden className="size-5" strokeWidth={2.5} />
          Agregar visitante
        </Boton>
        <p className="text-sm text-tinta-suave cifras" aria-live="polite">
          {cantidad} {cantidad === 1 ? 'entrada' : 'entradas'}
        </p>
      </div>

      <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-tinta-suave">
        <dt>Regular</dt>
        <dd className="cifras">{formatearPesos(PRECIO_ENTRADA_POR_PASE.REGULAR)}</dd>
        <dt>VIP</dt>
        <dd className="cifras">{formatearPesos(PRECIO_ENTRADA_POR_PASE.VIP)}</dd>
        <dt>Descuentos</dt>
        <dd>
          Gratis hasta {EDAD_MAX_NINOS_GRATIS} años · {PORCENTAJE_DESCUENTO} % hasta{' '}
          {EDAD_MAX_MENORES_DESCUENTO} años y desde {EDAD_MIN_JUBILADOS_DESCUENTO}
        </dd>
      </dl>
    </>
  );
};

interface FilaVisitanteProps {
  numero: number;
  visitante: VisitanteFormulario;
  precio?: number;
  errores?: ErroresVisitante;
  puedeQuitar: boolean;
  alCambiar: (cambios: Partial<Omit<VisitanteFormulario, 'id'>>) => void;
  alQuitar: () => void;
}

const FilaVisitante = ({
  numero,
  visitante,
  precio,
  errores,
  puedeQuitar,
  alCambiar,
  alQuitar,
}: FilaVisitanteProps) => {
  const base = `visitante-${visitante.id}`;
  const descuento = descripcionDescuento(precio, visitante.tipoPase);

  return (
    <li className="grid grid-cols-[2rem_1fr] gap-x-3 border-b border-renglon py-4 last:border-b-0">
      <span
        aria-hidden
        className="mt-6 grid size-8 place-items-center rounded-full border-[1.5px] border-primario text-sm font-bold text-primario cifras"
      >
        {numero}
      </span>

      <fieldset className="min-w-0">
        <legend className="sr-only">Visitante {numero}</legend>
        <div className="flex flex-wrap items-start gap-x-3 gap-y-3">
          <div>
            <label
              htmlFor={`${base}-edad`}
              className="block text-[13px] font-bold text-tinta-suave"
            >
              Edad
            </label>
            <input
              id={`${base}-edad`}
              type="number"
              inputMode="numeric"
              min={0}
              value={visitante.edad}
              onChange={(e) => alCambiar({ edad: e.target.value })}
              aria-invalid={errores?.edad ? true : undefined}
              aria-describedby={errores?.edad ? `${base}-error-edad` : undefined}
              placeholder="años"
              className={`mt-1 h-11 w-20 rounded-md border bg-superficie px-3 text-[17px] cifras placeholder:text-tinta-suave/70 focus:border-primario ${errores?.edad ? 'border-alerta' : 'border-tinta-suave/50'}`}
            />
          </div>

          <div
            role="radiogroup"
            aria-labelledby={`${base}-pase`}
            aria-invalid={errores?.tipoPase ? true : undefined}
            aria-describedby={errores?.tipoPase ? `${base}-error-pase` : undefined}
          >
            <span id={`${base}-pase`} className="block text-[13px] font-bold text-tinta-suave">
              Pase
            </span>
            <div
              className={`mt-1 inline-flex h-11 overflow-hidden rounded-md border-[1.5px] ${errores?.tipoPase ? 'border-alerta' : 'border-primario'}`}
            >
              {PASES.map((pase) => {
                const elegido = visitante.tipoPase === pase.valor;
                return (
                  <label
                    key={pase.valor}
                    className={`flex items-center px-3.5 text-[15px] transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-4 has-[:focus-visible]:outline-primario ${elegido ? 'bg-acento font-bold text-tinta' : 'text-primario hover:bg-fondo'}`}
                  >
                    <input
                      type="radio"
                      name={`${base}-pase`}
                      value={pase.valor}
                      checked={elegido}
                      onChange={() => alCambiar({ tipoPase: pase.valor })}
                      className="sr-only"
                    />
                    {pase.nombre}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
        {errores?.edad && <MensajeCampo id={`${base}-error-edad`}>{errores.edad}</MensajeCampo>}
        {errores?.tipoPase && (
          <MensajeCampo id={`${base}-error-pase`}>{errores.tipoPase}</MensajeCampo>
        )}

        <div className="mt-2.5 flex min-h-10 items-center gap-3">
          <p
            aria-live="polite"
            className="flex flex-1 flex-wrap items-baseline justify-between gap-x-3"
          >
            <span className="text-[13px] text-tinta-suave">{descuento}</span>
            <span className="ml-auto text-right text-[17px] font-bold cifras">
              {precio === undefined ? (
                <span className="font-normal text-tinta-suave">—</span>
              ) : (
                formatearPesos(precio)
              )}
            </span>
          </p>
          {puedeQuitar && (
            <button
              type="button"
              onClick={alQuitar}
              aria-label={`Quitar visitante ${numero}`}
              className="-mr-2 grid size-11 shrink-0 place-items-center rounded-md text-tinta-suave hover:bg-fondo hover:text-alerta"
            >
              <Trash2 aria-hidden className="size-5" />
            </button>
          )}
        </div>
      </fieldset>
    </li>
  );
};
