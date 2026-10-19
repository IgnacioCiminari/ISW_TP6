const requerida = (valor: string | undefined): string => {
  if (!valor) throw new Error('Falta la variable de entorno BD_RUTA.');
  return valor;
};

export const leerConfiguracionBaseDatos = (entorno: NodeJS.ProcessEnv = process.env) => ({
  ruta: requerida(entorno.BD_RUTA),
});
