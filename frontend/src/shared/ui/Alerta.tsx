import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

// Mensaje de validación fallida: rojo tierra sobre blanco, siempre con texto (CONVENCIONES §1.1).
export const Alerta = ({ children, id }: { children: ReactNode; id?: string }) => (
  <div
    id={id}
    role="alert"
    className="flex items-start gap-2.5 rounded-md border border-alerta bg-superficie px-3.5 py-3 text-[15px] leading-snug text-alerta"
  >
    <CircleAlert aria-hidden className="mt-px size-5 shrink-0" strokeWidth={2} />
    <span>{children}</span>
  </div>
);

export const MensajeCampo = ({ children, id }: { children: ReactNode; id: string }) => (
  <p id={id} className="mt-1.5 flex items-center gap-1.5 text-[13px] font-bold text-alerta">
    <CircleAlert aria-hidden className="size-3.5 shrink-0" strokeWidth={2.5} />
    {children}
  </p>
);
