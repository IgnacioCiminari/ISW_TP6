import { UserRound } from 'lucide-react';
import { CompraPage } from '../modules/compra/CompraPage';
import { USUARIO_SESION } from '../shared/sesion/sesion';

export const App = () => (
  <>
    <header className="bg-primario text-superficie">
      <div className="mx-auto flex h-14 max-w-xl items-center justify-between gap-3 px-4 lg:max-w-5xl">
        <a href="/" className="flex items-center gap-2.5 rounded-md">
          <img
            src="/logo-ecoharmony.png"
            alt=""
            width={38}
            height={38}
            className="size-[38px] rounded-full ring-2 ring-superficie/80"
          />
          <span className="leading-tight">
            <span className="block text-[17px] font-bold">EcoHarmony Park</span>
            <span className="block text-[13px] text-superficie/85">Comprar entradas</span>
          </span>
        </a>
        <p className="flex items-center gap-2 text-sm text-superficie/90">
          <UserRound aria-hidden className="size-5" />
          <span className="sr-only sm:not-sr-only">{USUARIO_SESION.email}</span>
        </p>
      </div>
    </header>
    <main>
      <CompraPage />
    </main>
  </>
);
