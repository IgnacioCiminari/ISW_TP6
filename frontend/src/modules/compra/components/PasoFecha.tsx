import { Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { Calendario } from '../../../shared/ui/Calendario';
import { MensajeCampo } from '../../../shared/ui/Alerta';
import { formatearFecha } from '../../../shared/ui/formato';
import { motivoFechaNoDisponible, parqueAbierto, type EstadoCompra } from '../useCompra';

export const PasoFecha = ({ compra }: { compra: EstadoCompra }) => (
  <>
    <EncabezadoPaso titulo="¿Qué día venís?">
      Elegí un día disponible en el calendario.
    </EncabezadoPaso>

    <div className="rounded-md bg-superficie p-4 sm:p-5">
      <Calendario
        valor={compra.fecha}
        hoy={compra.ahora}
        alElegir={compra.setFecha}
        motivoNoDisponible={(fecha) => motivoFechaNoDisponible(fecha, compra.ahora)}
        estaCerrado={(fecha) => !parqueAbierto(fecha)}
        descripcionId="leyenda-fecha"
      />
      <div className="mt-4 border-t border-renglon pt-3.5" aria-live="polite">
        {compra.fecha ? (
          <p className="text-[15px]">
            Elegiste el{' '}
            <strong className="font-bold text-primario">{formatearFecha(compra.fecha)}</strong>.
          </p>
        ) : (
          <p className="text-[15px] text-tinta-suave">Tocá un día disponible.</p>
        )}
        {compra.errorFecha && <MensajeCampo id="error-fecha">{compra.errorFecha}</MensajeCampo>}
      </div>
    </div>

    <p id="leyenda-fecha" className="mt-4 flex gap-2 text-sm text-tinta-suave">
      <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-primario" />
      Los días tachados el parque está cerrado; los atenuados no están a la venta.
    </p>
  </>
);

export const EncabezadoPaso = ({ titulo, children }: { titulo: string; children: ReactNode }) => (
  <header className="pb-4 pt-6 lg:pt-8">
    <h1 className="text-balance text-[26px] font-bold leading-tight text-primario lg:text-3xl">
      {titulo}
    </h1>
    <p className="mt-1.5 text-[15px] leading-snug text-tinta-suave">{children}</p>
  </header>
);
