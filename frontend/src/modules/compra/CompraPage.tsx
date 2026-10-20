import { useEffect, useRef } from 'react';
import { FichaVisita } from './components/FichaVisita';
import { GuiaPasos } from './components/GuiaPasos';
import { PantallaMercadoPago } from './components/PantallaMercadoPago';
import { PantallaResultado } from './components/PantallaResultado';
import { PasoFecha } from './components/PasoFecha';
import { PasoPago } from './components/PasoPago';
import { PasoVisitantes } from './components/PasoVisitantes';
import { useCompra } from './useCompra';

export const CompraPage = () => {
  const compra = useCompra();
  const contenido = useRef<HTMLDivElement>(null);
  const primerRender = useRef(true);

  // Al cambiar de paso, la pantalla vuelve arriba y el foco pasa al título del paso.
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    contenido.current?.querySelector('h1')?.focus({ preventScroll: true });
  }, [compra.paso, compra.etapa]);

  if (compra.etapa === 'mercado-pago' && compra.resultado) {
    return <PantallaMercadoPago resultado={compra.resultado} alVolver={() => compra.setEtapa('resultado')} />;
  }

  if (compra.etapa === 'resultado' && compra.resultado && compra.fecha) {
    return <PantallaResultado resultado={compra.resultado} fecha={compra.fecha} alComprarOtra={compra.volverAEmpezar} />;
  }

  return (
    <div className="mx-auto max-w-xl px-4 lg:grid lg:max-w-5xl lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-x-10">
      <div ref={contenido} className="pb-56 lg:pb-16 [&_h1]:outline-none">
        <GuiaPasos paso={compra.paso} />
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            compra.continuar();
          }}
        >
          {compra.paso === 'fecha' && <PasoFecha compra={compra} />}
          {compra.paso === 'visitantes' && <PasoVisitantes compra={compra} />}
          {compra.paso === 'pago' && <PasoPago compra={compra} />}
          <button type="submit" hidden aria-hidden tabIndex={-1} />
        </form>
      </div>
      <FichaVisita compra={compra} />
    </div>
  );
};
