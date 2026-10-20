import { MailCheck } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Boton } from '../../../shared/ui/Boton';

// Simulación del envío de mail (FAQ 5): un modal que confirma a qué casilla se envió.
export const ModalMail = ({ email, alCerrar }: { email: string; alCerrar: () => void }) => {
  const dialogo = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogo.current;
    if (d && !d.open) d.showModal();
  }, []);

  return (
    <dialog
      ref={dialogo}
      onClose={alCerrar}
      aria-labelledby="titulo-mail"
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-md bg-superficie p-6 text-tinta shadow-[0_12px_40px_color-mix(in_srgb,var(--color-tinta)_25%,transparent)]"
    >
      <span
        aria-hidden
        className="grid size-12 place-items-center rounded-full bg-acento text-primario"
      >
        <MailCheck className="size-6" />
      </span>
      <h2 id="titulo-mail" className="mt-4 text-[22px] font-bold leading-tight text-primario">
        Mail enviado
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-tinta-suave">
        Mandamos la confirmación a <strong className="font-bold text-tinta">{email}</strong> con el
        número de orden, el detalle de visitantes, los subtotales, el total y el código QR de
        acceso.
      </p>
      <form method="dialog" className="mt-6">
        <Boton type="submit" ancho autoFocus>
          Entendido
        </Boton>
      </form>
    </dialog>
  );
};
