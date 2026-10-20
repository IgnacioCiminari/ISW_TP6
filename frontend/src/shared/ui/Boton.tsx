import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variante = 'primario' | 'secundario' | 'texto';

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  ancho?: boolean;
  children: ReactNode;
}

const ESTILOS: Record<Variante, string> = {
  primario:
    // 19px negrita es texto grande para WCAG: mantiene contraste AA sobre el verde medio del hover.
    'h-13 px-6 bg-primario text-superficie text-[19px] font-bold hover:bg-secundario active:bg-secundario disabled:bg-primario/60',
  secundario:
    'h-12 px-5 border-[1.5px] border-secundario bg-superficie text-primario font-bold hover:bg-fondo disabled:opacity-50',
  texto: 'h-11 px-2 text-primario font-bold underline underline-offset-4 decoration-1 hover:decoration-2',
};

export const Boton = ({ variante = 'primario', ancho = false, className = '', children, ...props }: BotonProps) => (
  <button
    type="button"
    className={`inline-flex items-center justify-center gap-2 rounded-md transition-colors duration-150 disabled:cursor-not-allowed ${ESTILOS[variante]} ${ancho ? 'w-full' : ''} ${className}`}
    {...props}
  >
    {children}
  </button>
);
