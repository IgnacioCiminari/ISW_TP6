import { createServer, type Server, type ServerResponse } from 'node:http';
import type { CompraController } from './modules/compras/compras.controller';

const leerCuerpo = async (solicitud: AsyncIterable<Buffer>): Promise<unknown> => {
  const partes: Buffer[] = [];
  for await (const parte of solicitud) partes.push(parte);
  return JSON.parse(Buffer.concat(partes).toString());
};

const responderJson = (respuesta: ServerResponse, estado: number, cuerpo: unknown): void => {
  respuesta.writeHead(estado, { 'content-type': 'application/json' });
  respuesta.end(JSON.stringify(cuerpo));
};

export const crearServidor = (controlador: CompraController): Server =>
  createServer(async (solicitud, respuesta) => {
    if (solicitud.method !== 'POST' || solicitud.url !== '/api/compras') {
      responderJson(respuesta, 404, { error: 'No encontrado.' });
      return;
    }

    try {
      const resultado = await controlador.comprar(await leerCuerpo(solicitud));
      responderJson(respuesta, resultado.estado, resultado.cuerpo);
    } catch {
      responderJson(respuesta, 400, { error: 'Solicitud inválida.' });
    }
  });
