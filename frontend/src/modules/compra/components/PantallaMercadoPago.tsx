import { CircleCheck, LoaderCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Boton } from '../../../shared/ui/Boton';
import { formatearTotal } from '../../../shared/ui/formato';
import type { ResultadoCompraHttp } from '../useCompra';
import { codigoCorto } from './Sello';

const DEMORA_REDIRECCION_MS = 1400;

// Simulación de la redirección a Mercado Pago (FAQ 4). No hay cobro real.
export const PantallaMercadoPago = ({
  resultado,
  alVolver,
}: {
  resultado: ResultadoCompraHttp;
  alVolver: () => void;
}) => {
  const [aprobado, setAprobado] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const espera = window.setTimeout(() => setAprobado(true), DEMORA_REDIRECCION_MS);
    return () => window.clearTimeout(espera);
  }, []);

  useEffect(() => {
    if (aprobado) titulo.current?.focus();
  }, [aprobado]);

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-md bg-superficie p-6 pt-0 text-center" aria-live="polite">
        <div className="-mx-6 mb-6 border-b border-renglon px-6 py-3 text-left text-sm font-bold text-tinta-suave">
          Mercado Pago (simulación)
        </div>
        {aprobado ? (
          <>
            <CircleCheck aria-hidden className="mx-auto size-14 text-primario" strokeWidth={1.75} />
            <h1
              ref={titulo}
              tabIndex={-1}
              className="mt-3 text-[26px] font-bold text-primario outline-none"
            >
              Compra exitosa
            </h1>
            <p className="mt-1.5 text-[15px] text-tinta-suave">
              Se aprobó el pago con tarjeta de crédito.
            </p>
            <dl className="mt-5 border-t border-renglon text-left text-[15px]">
              <div className="flex justify-between border-b border-renglon py-2.5">
                <dt className="text-tinta-suave">Importe</dt>
                <dd className="font-bold cifras">{formatearTotal(resultado.total)}</dd>
              </div>
              <div className="flex justify-between border-b border-renglon py-2.5">
                <dt className="text-tinta-suave">Orden</dt>
                <dd className="font-bold cifras">{codigoCorto(resultado.numeroOrden)}</dd>
              </div>
            </dl>
            <Boton ancho className="mt-6" onClick={alVolver}>
              Volver a EcoHarmony Park
            </Boton>
          </>
        ) : (
          <>
            <LoaderCircle aria-hidden className="mx-auto size-12 animate-spin text-secundario" />
            <h1 className="mt-4 text-xl font-bold">Te estamos llevando a Mercado Pago…</h1>
            <p className="mt-1.5 text-[15px] text-tinta-suave">
              Total a pagar: {formatearTotal(resultado.total)}
            </p>
          </>
        )}
      </div>
      <p className="mt-4 text-center text-[13px] text-tinta-suave">
        Simulación para el TP: no se realiza ningún cobro.
      </p>
    </section>
  );
};
