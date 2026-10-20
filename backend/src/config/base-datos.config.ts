import { configuracion } from './configuracion';

export const leerConfiguracionBaseDatos = (): typeof configuracion.baseDatos =>
  configuracion.baseDatos;
