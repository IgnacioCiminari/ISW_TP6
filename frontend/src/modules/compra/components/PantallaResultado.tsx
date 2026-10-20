import { useEffect, useRef, useState, type ReactNode } from 'react';
import { USUARIO_SESION } from '../../../shared/sesion/sesion';
import { Boton } from '../../../shared/ui/Boton';
import { formatearFecha, formatearTotal } from '../../../shared/ui/formato';
import type { ResultadoCompraHttp } from '../useCompra';
import { ModalMail } from './ModalMail';
import { Sello } from './Sello';

interface PantallaResultadoProps {
  resultado: ResultadoCompraHttp;
  fecha: Date;
  alComprarOtra: () => void;
}

export const PantallaResultado = ({ resultado, fecha, alComprarOtra }: PantallaResultadoProps) => {
  const [mailVisible, setMailVisible] = useState(true);
  const titulo = useRef<HTMLHeadingElement>(null);
  const { cantidadEntradas: cantidad, pago } = resultado;
  const entradas = `${cantidad} ${cantidad === 1 ? 'entrada' : 'entradas'}`;

  useEffect(() => {
    if (!mailVisible) titulo.current?.focus();
  }, [mailVisible]);

  return (
    <section className="mx-auto max-w-xl px-4 pb-12 pt-8 lg:pt-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            ref={titulo}
            tabIndex={-1}
            className="text-balance text-[28px] font-bold leading-tight text-primario outline-none lg:text-4xl"
          >
            ¡Listo! Tu visita está asegurada
          </h1>
          <p className="mt-2 text-[17px] leading-snug">
            Compraste <strong className="font-bold">{entradas}</strong> para el{' '}
            <strong className="font-bold">{formatearFecha(fecha)}</strong>.
          </p>
        </div>
        <Sello numeroOrden={resultado.numeroOrden} />
      </div>

      <div className="mt-6 rounded-md border-t-[3px] border-primario bg-superficie px-4 pb-2 pt-3 sm:px-5">
        <h2 className="text-[15px] font-bold text-primario">Ficha de visita</h2>
        <dl className="mt-1 text-[15px]">
          <Renglon termino="Fecha">{formatearFecha(fecha)}</Renglon>
          <Renglon termino="Entradas">{entradas}</Renglon>
          <Renglon termino="Pago">
            {pago.formaPago === 'TARJETA'
              ? 'Tarjeta · pagado en Mercado Pago'
              : 'Efectivo · pagás en boletería'}
          </Renglon>
          <Renglon termino="N.º de orden">
            <span className="break-all text-[13px] cifras">{resultado.numeroOrden}</span>
          </Renglon>
          <Renglon termino="Total">
            <span className="text-[22px] font-bold text-primario cifras">
              {formatearTotal(resultado.total)}
            </span>
          </Renglon>
        </dl>
      </div>

      {pago.formaPago === 'EFECTIVO' && (
        <p className="mt-4 text-[15px] leading-snug text-tinta-suave">
          Presentá el número de orden en boletería y aboná {formatearTotal(resultado.total)} antes
          de entrar.
        </p>
      )}

      <Boton variante="secundario" className="mt-6" onClick={alComprarOtra}>
        Comprar otras entradas
      </Boton>

      {mailVisible && (
        <ModalMail email={USUARIO_SESION.email} alCerrar={() => setMailVisible(false)} />
      )}
    </section>
  );
};

const Renglon = ({ termino, children }: { termino: string; children: ReactNode }) => (
  <div className="grid grid-cols-[7rem_1fr] items-baseline gap-x-3 border-b border-renglon py-2.5 last:border-b-0">
    <dt className="text-tinta-suave">{termino}</dt>
    <dd className="min-w-0">{children}</dd>
  </div>
);
