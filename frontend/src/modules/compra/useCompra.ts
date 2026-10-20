import { useState } from 'react';
import type { ResultadoCompra, SolicitudCompra } from '@backend/modules/compras/compras.types';
import { PasarelaPagoSimulada } from '@backend/modules/pagos/pagos.pasarela-simulada';
import { PagosService } from '@backend/modules/pagos/pagos.service';
import type { FormaPago, TipoPase, Visitante } from '@backend/modules/pagos/pagos.types';
import { ParqueService } from '@backend/modules/parque/parque.service';
import { ErrorConexion, postJson } from '../../shared/http/cliente';
import { USUARIO_SESION } from '../../shared/sesion/sesion';
import { aFechaIso } from '../../shared/ui/formato';

// Las reglas del parque y los precios son los del backend: el front los usa, no los copia.
const parque = new ParqueService();
// Solo se usa para calcular precios; la pasarela nunca se invoca desde el front.
const pagos = new PagosService(new PasarelaPagoSimulada(''));

export type PasoCompra = 'fecha' | 'visitantes' | 'pago';
export const PASOS: PasoCompra[] = ['fecha', 'visitantes', 'pago'];
export type Etapa = 'formulario' | 'mercado-pago' | 'resultado';

// La API recibe y devuelve la fecha como texto `AAAA-MM-DD` / ISO.
type SolicitudCompraHttp = Omit<SolicitudCompra, 'fechaVisita'> & { fechaVisita: string };
export type ResultadoCompraHttp = Omit<ResultadoCompra, 'fechaVisita'> & { fechaVisita: string };

// Estado del formulario: la edad se edita como texto y el pase empieza sin elegir.
export interface VisitanteFormulario {
  id: string;
  edad: string;
  tipoPase?: TipoPase;
}

export interface ErroresVisitante {
  edad?: string;
  tipoPase?: string;
}

const URL_COMPRAS = '/api/compras';

const nuevoVisitante = (): VisitanteFormulario => ({ id: crypto.randomUUID(), edad: '' });

/** Edad como número entero, o `undefined` si el campo no tiene un número. */
export const leerEdad = (texto: string): number | undefined =>
  /^\d+$/.test(texto.trim()) ? Number(texto) : undefined;

/** El visitante con el tipo que espera el backend, o `undefined` si falta completar algún campo. */
const aVisitante = ({ edad, tipoPase }: VisitanteFormulario): Visitante | undefined => {
  const edadNumerica = leerEdad(edad);
  return edadNumerica === undefined || !tipoPase ? undefined : { edad: edadNumerica, tipoPase };
};

/** Mensaje del backend que explica por qué no se puede elegir la fecha, o `undefined` si se puede. */
export const motivoFechaNoDisponible = (fecha: Date, ahora: Date): string | undefined => {
  try {
    parque.validarFechaVisita(fecha, ahora);
    return undefined;
  } catch (error) {
    return error instanceof Error ? error.message : 'Fecha no disponible.';
  }
};

export const parqueAbierto = (fecha: Date): boolean => parque.estaAbierto(fecha);

// Sin estos campos no se puede armar la solicitud; las reglas de negocio las valida el backend al confirmar.
const validarCampos = (visitante: VisitanteFormulario): ErroresVisitante => ({
  edad:
    visitante.edad.trim() === ''
      ? 'Ingresá la edad.'
      : leerEdad(visitante.edad) === undefined
        ? 'Ingresá la edad en años.'
        : undefined,
  tipoPase: visitante.tipoPase ? undefined : 'Elegí un pase.',
});

const leerMensajeError = (cuerpo: unknown): string | undefined =>
  typeof cuerpo === 'object' &&
  cuerpo !== null &&
  'error' in cuerpo &&
  typeof cuerpo.error === 'string'
    ? cuerpo.error
    : undefined;

export const useCompra = () => {
  // El reloj se lee acá, en el borde de la UI; las reglas del backend lo reciben como `ahora`.
  const ahora = new Date();
  const [etapa, setEtapa] = useState<Etapa>('formulario');
  const [paso, setPaso] = useState<PasoCompra>('fecha');
  const [fecha, setFecha] = useState<Date>();
  const [visitantes, setVisitantes] = useState<VisitanteFormulario[]>(() => [nuevoVisitante()]);
  const [formaPago, setFormaPago] = useState<FormaPago>();
  const [intentoAvanzar, setIntentoAvanzar] = useState<Record<PasoCompra, boolean>>({
    fecha: false,
    visitantes: false,
    pago: false,
  });
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string>();
  const [resultado, setResultado] = useState<ResultadoCompraHttp>();

  const errorFecha = fecha ? motivoFechaNoDisponible(fecha, ahora) : 'Elegí una fecha de visita.';
  const erroresVisitantes = new Map(visitantes.map((v) => [v.id, validarCampos(v)]));

  // Precios: el detalle (subtotales y total) lo calcula el backend sobre los visitantes ya completos.
  const completos = visitantes.flatMap((v) => {
    const visitante = aVisitante(v);
    return visitante ? [{ id: v.id, visitante }] : [];
  });
  const detalle = pagos.calcularDetalle(completos.map((c) => c.visitante));
  const precioPorId = new Map(completos.map((c, i) => [c.id, detalle.subtotales[i].precio]));
  const subtotales = visitantes.map((v) => ({ id: v.id, precio: precioPorId.get(v.id) }));
  const total = detalle.total;
  const estanCompletos = completos.length === visitantes.length;

  const errorPago = formaPago ? undefined : 'Elegí cómo vas a pagar.';

  const pasoValido: Record<PasoCompra, boolean> = {
    fecha: !errorFecha,
    visitantes: estanCompletos,
    pago: !errorPago,
  };

  // Solo se vuelve con «Anterior»: lo cargado en el paso que se abandona se descarta.
  const retroceder = () => {
    const actual = PASOS.indexOf(paso);
    if (actual === 0) return;
    if (paso === 'visitantes') setVisitantes([nuevoVisitante()]);
    if (paso === 'pago') setFormaPago(undefined);
    setIntentoAvanzar((previo) => ({ ...previo, [paso]: false }));
    setErrorEnvio(undefined);
    setPaso(PASOS[actual - 1]);
  };

  const confirmar = async () => {
    if (!fecha || !formaPago || !estanCompletos) return;
    const solicitud: SolicitudCompraHttp = {
      email: USUARIO_SESION.email,
      fechaVisita: aFechaIso(fecha),
      cantidad: completos.length,
      visitantes: completos.map((c) => c.visitante),
      formaPago,
    };
    setEnviando(true);
    setErrorEnvio(undefined);
    try {
      const { estado, cuerpo } = await postJson(URL_COMPRAS, solicitud);
      const esExitosa = estado >= 200 && estado < 300;
      if (esExitosa) {
        const compra = cuerpo as ResultadoCompraHttp;
        setResultado(compra);
        setEtapa(compra.pago.formaPago === 'TARJETA' ? 'mercado-pago' : 'resultado');
      } else {
        // El backend siempre responde `{ error }` con su mensaje; sin él no hay API (p. ej. el sitio estático).
        setErrorEnvio(
          leerMensajeError(cuerpo) ??
            'El servicio de compras no está disponible en este momento. Probá más tarde.',
        );
      }
    } catch (error) {
      setErrorEnvio(error instanceof ErrorConexion ? error.message : 'Error inesperado.');
    } finally {
      setEnviando(false);
    }
  };

  const continuar = () => {
    setIntentoAvanzar((previo) => ({ ...previo, [paso]: true }));
    if (!pasoValido[paso]) return;
    if (paso === 'pago') {
      void confirmar();
      return;
    }
    setPaso(PASOS[PASOS.indexOf(paso) + 1]);
  };

  const agregarVisitante = () => setVisitantes((lista) => [...lista, nuevoVisitante()]);

  const quitarVisitante = (id: string) =>
    setVisitantes((lista) => (lista.length > 1 ? lista.filter((v) => v.id !== id) : lista));

  const actualizarVisitante = (id: string, cambios: Partial<Omit<VisitanteFormulario, 'id'>>) =>
    setVisitantes((lista) => lista.map((v) => (v.id === id ? { ...v, ...cambios } : v)));

  const elegirFormaPago = (forma: FormaPago) => {
    setFormaPago(forma);
    setErrorEnvio(undefined);
  };

  const volverAEmpezar = () => {
    setEtapa('formulario');
    setPaso('fecha');
    setFecha(undefined);
    setVisitantes([nuevoVisitante()]);
    setFormaPago(undefined);
    setIntentoAvanzar({ fecha: false, visitantes: false, pago: false });
    setErrorEnvio(undefined);
    setResultado(undefined);
  };

  return {
    ahora,
    etapa,
    setEtapa,
    paso,
    continuar,
    retroceder,
    fecha,
    setFecha,
    errorFecha: intentoAvanzar.fecha ? errorFecha : undefined,
    visitantes,
    erroresVisitantes,
    mostrarErroresVisitantes: intentoAvanzar.visitantes,
    agregarVisitante,
    quitarVisitante,
    actualizarVisitante,
    subtotales,
    total,
    formaPago,
    elegirFormaPago,
    errorPago: intentoAvanzar.pago ? errorPago : undefined,
    enviando,
    errorEnvio,
    resultado,
    volverAEmpezar,
  };
};

export type EstadoCompra = ReturnType<typeof useCompra>;
