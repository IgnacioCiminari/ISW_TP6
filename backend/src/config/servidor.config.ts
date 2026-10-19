export const leerConfiguracionServidor = (entorno: NodeJS.ProcessEnv = process.env) => {
  const host = entorno.HOST;
  const puerto = Number(entorno.PUERTO);
  if (!host) throw new Error('Falta la variable de entorno HOST.');
  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
    throw new Error('PUERTO debe ser un entero entre 1 y 65535.');
  }
  return { host, puerto };
};
