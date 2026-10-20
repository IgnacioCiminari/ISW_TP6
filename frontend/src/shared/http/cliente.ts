import type { RespuestaCompraHttp } from '@backend/modules/compras/compras.controller';

export class ErrorConexion extends Error {
  constructor() {
    super('No pudimos conectarnos con el servidor. Revisá tu conexión y probá de nuevo.');
  }
}

// La respuesta tiene la misma forma que la que arma el controlador del backend.
export const postJson = async (url: string, cuerpo: unknown): Promise<RespuestaCompraHttp> => {
  let respuesta: Response;
  try {
    respuesta = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(cuerpo),
    });
  } catch {
    throw new ErrorConexion();
  }
  const texto = await respuesta.text();
  let json: unknown = undefined;
  try {
    json = texto ? JSON.parse(texto) : undefined;
  } catch {
    json = undefined;
  }
  return { estado: respuesta.status, cuerpo: json };
};
