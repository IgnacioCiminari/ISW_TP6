import { createServer, type Server } from 'node:http';
import type { CompraController } from './modules/compras/compras.controller';

const leerCuerpo = async (solicitud: AsyncIterable<Buffer>): Promise<unknown> => {
  const partes: Buffer[] = [];
  for await (const parte of solicitud) partes.push(parte);
  return JSON.parse(Buffer.concat(partes).toString());
};

export const crearServidor = (controlador: CompraController): Server =>
  createServer(async (solicitud, respuesta) => {
    if (solicitud.method !== 'POST' || solicitud.url !== '/api/compras') {
      respuesta.writeHead(404, { 'content-type': 'application/json' });
      respuesta.end(JSON.stringify({ error: 'No encontrado.' }));
      return;
    }

    try {
      const resultado = await controlador.comprar(await leerCuerpo(solicitud));
      respuesta.writeHead(resultado.estado, { 'content-type': 'application/json' });
      respuesta.end(JSON.stringify(resultado.cuerpo));
    } catch {
      respuesta.writeHead(400, { 'content-type': 'application/json' });
      respuesta.end(JSON.stringify({ error: 'Solicitud inválida.' }));
    }
  });
