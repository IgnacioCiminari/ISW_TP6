import { configuracion } from './configuracion';

export const leerConfiguracionServidor = (): typeof configuracion.servidor =>
  configuracion.servidor;
