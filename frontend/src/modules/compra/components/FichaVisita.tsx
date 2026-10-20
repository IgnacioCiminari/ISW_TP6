import { ChevronLeft, ChevronUp, LoaderCircle } from 'lucide-react';
import { PASOS } from '../useCompra';
import { useState, type ReactNode } from 'react';
import { Boton } from '../../../shared/ui/Boton';
import { formatearFecha, formatearPesos, formatearTotal } from '../../../shared/ui/formato';
import { leerEdad, type EstadoCompra } from '../useCompra';

const ACCION: Record<EstadoCompra['paso'], string> = {
  fecha: 'Continuar',
  visitantes: 'Continuar al pago',
  pago: 'Confirmar compra',
};

const NOMBRE_PASE = { REGULAR: 'Regular', VIP: 'VIP' } as const;
const NOMBRE_FORMA_PAGO = { TARJETA: 'Tarjeta (Mercado Pago)', EFECTIVO: 'Efectivo en boletería' } as const;

/**
 * La ficha de visita: el resumen que se completa a medida que se elige.
 * En el celular queda fija al pie (con el detalle plegable); desde lg es una columna lateral.
 */
export const FichaVisita = ({ compra }: { compra: EstadoCompra }) => {
  const [abierta, setAbierta] = useState(false);
  const cantidad = compra.visitantes.length;
  const enPasoVisitantesOMas = PASOS.indexOf(compra.paso) >= 1;
  const puedeVolver = compra.paso !== 'fecha';

  return (
    <aside
      aria-label="Ficha de visita"
      className="fixed inset-x-0 bottom-0 z-10 border-t-[3px] border-primario bg-superficie shadow-[0_-6px_20px_color-mix(in_srgb,var(--color-tinta)_12%,transparent)] lg:sticky lg:top-6 lg:mt-8 lg:rounded-md lg:border-t-[3px] lg:shadow-none"
    >
      <div className="mx-auto max-w-xl px-4 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-2 lg:px-5 lg:pb-5 lg:pt-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[15px] font-bold text-primario">Ficha de visita</h2>
          {/* En el celular el lugar del sello cruza el filete superior, como una etiqueta prendida. */}
          <SlotSello className="-my-5 size-13 lg:my-0 lg:ml-auto lg:size-14" />
          <button
            type="button"
            onClick={() => setAbierta((a) => !a)}
            aria-expanded={abierta}
            aria-controls="detalle-ficha"
            className="-mr-2 ml-auto flex h-9 items-center gap-1 rounded-md px-2 text-sm font-bold text-primario hover:bg-fondo lg:hidden"
          >
            {abierta ? 'Ocultar detalle' : 'Ver detalle'}
            <ChevronUp aria-hidden className={`size-4 transition-transform duration-200 ${abierta ? '' : 'rotate-180'}`} />
          </button>
        </div>

        <dl
          id="detalle-ficha"
          className={`${abierta ? 'block' : 'hidden'} mt-1 max-h-[42vh] overflow-y-auto text-[15px] lg:block lg:max-h-none`}
        >
          <Renglon termino="Fecha">{compra.fecha ? formatearFecha(compra.fecha, 'media') : <Pendiente />}</Renglon>
          {enPasoVisitantesOMas ? (
            compra.visitantes.map((v, i) => {
              const edad = leerEdad(v.edad);
              const precio = compra.subtotales[i]?.precio;
              return (
                <Renglon
                  key={v.id}
                  termino={`Visitante ${i + 1}`}
                  importe={precio === undefined ? undefined : formatearPesos(precio)}
                >
                  {edad === undefined ? '—' : `${edad} años`}
                  {v.tipoPase ? ` · ${NOMBRE_PASE[v.tipoPase]}` : ''}
                </Renglon>
              );
            })
          ) : (
            <Renglon termino="Visitantes">
              <Pendiente />
            </Renglon>
          )}
          <Renglon termino="Pago">{compra.formaPago ? NOMBRE_FORMA_PAGO[compra.formaPago] : <Pendiente />}</Renglon>
        </dl>

        {/* Versión plegada (celular): dos renglones de la etiqueta y, al lado, el total. */}
        <div className={`${abierta ? 'hidden' : 'flex'} mb-2.5 items-end gap-4 lg:hidden`}>
          <dl className="min-w-0 flex-1 text-[15px]">
            <Renglon termino="Fecha" compacto>
              {compra.fecha ? formatearFecha(compra.fecha, 'corta') : <Pendiente />}
            </Renglon>
            <Renglon termino="Entradas" compacto>
              {enPasoVisitantesOMas ? cantidad : <Pendiente />}
            </Renglon>
          </dl>
          <p className="pb-1.5 text-right">
            <span className="block text-[13px] font-bold">Total</span>
            <span className="block text-[26px] font-bold leading-none text-primario cifras">
              {formatearTotal(compra.total)}
            </span>
          </p>
        </div>

        <div
          className={`${abierta ? 'flex' : 'hidden'} mb-3 mt-2 items-baseline justify-between border-t border-renglon pt-2.5 lg:mt-3 lg:flex`}
        >
          <span className="text-[15px] font-bold">Total</span>
          <span className="text-[26px] font-bold leading-none text-primario cifras" aria-live="polite">
            {formatearTotal(compra.total)}
          </span>
        </div>

        {/* En el celular van en fila; en la columna lateral, apilados para que «Continuar» use todo el ancho. */}
        <div className="flex gap-3 lg:flex-col-reverse">
          {puedeVolver && (
            <Boton variante="secundario" className="h-13 shrink-0 px-3.5 lg:h-12 lg:w-full" onClick={compra.retroceder} disabled={compra.enviando}>
              <ChevronLeft aria-hidden className="-ml-1 size-5" />
              Anterior
            </Boton>
          )}
          <Boton
            ancho
            className="min-w-0 px-4"
            onClick={compra.continuar}
            disabled={compra.enviando}
            aria-describedby={compra.errorEnvio ? 'error-envio' : undefined}
          >
            {compra.enviando ? (
              <>
                <LoaderCircle aria-hidden className="size-5 animate-spin" />
                Confirmando…
              </>
            ) : (
              ACCION[compra.paso]
            )}
          </Boton>
        </div>
      </div>
    </aside>
  );
};

interface RenglonProps {
  termino: string;
  importe?: string;
  compacto?: boolean;
  children: ReactNode;
}

const Renglon = ({ termino, importe, compacto = false, children }: RenglonProps) => (
  <div
    className={`grid gap-x-3 border-b border-renglon last:border-b-0 ${compacto ? 'grid-cols-[4.5rem_1fr] py-1' : 'grid-cols-[5.75rem_1fr_auto] py-2'}`}
  >
    <dt className="text-tinta-suave">{termino}</dt>
    <dd className="min-w-0">{children}</dd>
    <dd className="text-right font-bold cifras">{importe}</dd>
  </div>
);

// Dato sin completar: un renglón vacío esperando la anotación.
const Pendiente = () => (
  <span className="inline-block h-4 w-24 border-b border-dashed border-tinta-suave/50 align-baseline">
    <span className="sr-only">Pendiente</span>
  </span>
);

// Lugar del sello: vacío hasta confirmar; el sello de la pantalla final lo ocupa.
const SlotSello = ({ className }: { className: string }) => (
  <span
    aria-hidden
    className={`${className} grid shrink-0 -rotate-8 place-items-center rounded-full border-2 border-dashed border-secundario bg-fondo text-center text-[11px] font-bold uppercase leading-[1.1] text-primario`}
  >
    sin
    <br />
    sellar
  </span>
);
