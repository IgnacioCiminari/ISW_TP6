import { useId } from 'react';

const LARGO_CODIGO = 8;

// El número de orden es `ORD-<uuid>`: el sello lleva sus primeros caracteres, la ficha el número completo.
export const codigoCorto = (numeroOrden: string) =>
  numeroOrden.replace(/^ORD-/, '').slice(0, LARGO_CODIGO).toUpperCase();

// Sello circular que marca la ficha confirmada.
export const Sello = ({ numeroOrden }: { numeroOrden: string }) => {
  const curva = useId();
  return (
    <svg
      role="img"
      aria-label={`Compra confirmada, orden ${codigoCorto(numeroOrden)}`}
      viewBox="0 0 140 140"
      className="sello size-32 shrink-0 text-primario sm:size-36"
    >
      <defs>
        <path id={curva} d="M70 70 m-50 0 a50 50 0 1 1 100 0 a50 50 0 1 1 -100 0" />
      </defs>
      <circle cx="70" cy="70" r="66" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="70" cy="70" r="40" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* textLength reparte el texto en la circunferencia exacta (2π·50 ≈ 314) para que no se pise. */}
      <text fill="currentColor" fontSize="10.5" fontWeight="700">
        <textPath href={`#${curva}`} textLength="308" lengthAdjust="spacing">
          ECOHARMONY PARK · BIOPARQUE · CONFIRMADA ·
        </textPath>
      </text>
      <text x="70" y="64" textAnchor="middle" fill="currentColor" fontSize="9.5" fontWeight="700" letterSpacing="1.5">
        ORDEN
      </text>
      <text
        x="70"
        y="82"
        textAnchor="middle"
        fill="currentColor"
        fontSize="13"
        fontWeight="700"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {codigoCorto(numeroOrden)}
      </text>
    </svg>
  );
};
