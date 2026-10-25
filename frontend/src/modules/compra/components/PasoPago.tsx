import { Banknote, CreditCard, MailCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Alerta, MensajeCampo } from '../../../shared/ui/Alerta';
import { USUARIO_SESION } from '../../../shared/sesion/sesion';
import type { FormaPago } from '@backend/modules/pagos/pagos.types';
import type { EstadoCompra } from '../useCompra';
import { EncabezadoPaso } from './PasoFecha';

const FORMAS: { valor: FormaPago; titulo: string; detalle: string; Icono: LucideIcon }[] = [
  {
    valor: 'TARJETA',
    titulo: 'Tarjeta de crédito',
    detalle: 'Pagás ahora en Mercado Pago.',
    Icono: CreditCard,
  },
  {
    valor: 'EFECTIVO',
    titulo: 'Efectivo',
    detalle: 'Pagás en boletería el día de la visita.',
    Icono: Banknote,
  },
];

export const PasoPago = ({ compra }: { compra: EstadoCompra }) => (
  <>
    <EncabezadoPaso titulo="¿Cómo pagás?">
      Revisá la ficha y elegí la forma de pago para confirmar.
    </EncabezadoPaso>

    {compra.errorEnvio && (
      <div className="mb-4">
        <Alerta id="error-envio">{compra.errorEnvio}</Alerta>
      </div>
    )}

    <fieldset
      role="radiogroup"
      aria-invalid={compra.errorPago ? true : undefined}
      aria-describedby={compra.errorPago ? 'error-pago' : undefined}
      className={`rounded-md bg-superficie p-2 ${compra.errorPago ? 'ring-1 ring-alerta' : ''}`}
    >
      <legend className="sr-only">Forma de pago</legend>
      {FORMAS.map(({ valor, titulo, detalle, Icono }, i) => {
        const elegida = compra.formaPago === valor;
        return (
          <label
            key={valor}
            className={[
              'flex items-center gap-3.5 rounded-md border-2 px-3 py-3.5 transition-colors duration-150',
              'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primario',
              elegida ? 'border-primario bg-acento' : 'border-transparent hover:bg-fondo',
              i > 0 && !elegida && compra.formaPago !== FORMAS[i - 1].valor ? 'renglon-arriba' : '',
            ].join(' ')}
          >
            <input
              type="radio"
              name="forma-pago"
              value={valor}
              checked={elegida}
              onChange={() => compra.elegirFormaPago(valor)}
              className="sr-only"
            />
            <span
              aria-hidden
              className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${elegida ? 'border-primario bg-superficie' : 'border-tinta-suave/60'}`}
            >
              {elegida && <span className="size-2.5 rounded-full bg-primario" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-[17px] font-bold">
                <Icono aria-hidden className="size-[18px] text-primario" />
                {titulo}
              </span>
              <span
                className={`mt-0.5 block text-[15px] leading-snug ${elegida ? 'text-tinta' : 'text-tinta-suave'}`}
              >
                {detalle}
              </span>
            </span>
          </label>
        );
      })}
      {compra.errorPago && (
        <div className="px-3 pb-2">
          <MensajeCampo id="error-pago">{compra.errorPago}</MensajeCampo>
        </div>
      )}
    </fieldset>

    <p className="mt-5 flex gap-2.5 text-[15px] leading-snug text-tinta-suave">
      <MailCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-primario" />
      <span>
        Al confirmar te enviamos el comprobante con el código QR a{' '}
        <strong className="font-bold text-tinta">{USUARIO_SESION.email}</strong>.
      </span>
    </p>
  </>
);
