const requerida = (valor: string | undefined, nombre: string): string => {
  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre}.`);
  }
  return valor;
};

export const leerConfiguracionSimulacion = (
  entorno: NodeJS.ProcessEnv = process.env,
) => ({
  urlPagoSimulado: requerida(entorno.PAGO_SIMULADO_URL, 'PAGO_SIMULADO_URL'),
  emailUsuarioRegistrado: requerida(entorno.USUARIO_REGISTRADO_EMAIL, 'USUARIO_REGISTRADO_EMAIL'),
});
