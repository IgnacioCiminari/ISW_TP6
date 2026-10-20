import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ConexionSqlite } from '../../../src/infraestructura/bd/conexion-sqlite';
import { SqliteComprasRepository } from '../../../src/modules/compras/compras.repository';
import type { NuevaCompra } from '../../../src/modules/compras/compras.types';

const compra: NuevaCompra = {
  email: 'visitante@mail.com',
  fechaVisita: new Date(2026, 9, 20),
  visitantes: [
    { edad: 35, tipoPase: 'VIP' },
    { edad: 10, tipoPase: 'REGULAR' },
  ],
  formaPago: 'TARJETA',
  detalle: {
    subtotales: [
      { edad: 35, tipoPase: 'VIP', precio: 20000 },
      { edad: 10, tipoPase: 'REGULAR', precio: 5000 },
    ],
    total: 25000,
  },
};

describe('SqliteComprasRepository', () => {
  let conexion: ConexionSqlite;
  let repositorio: SqliteComprasRepository;

  beforeEach(() => {
    conexion = new ConexionSqlite(':memory:');
    repositorio = new SqliteComprasRepository(conexion);
    conexion.baseDatos.prepare('INSERT INTO usuarios(email) VALUES (?)').run(compra.email);
  });

  afterEach(() => conexion.cerrar());

  it('cuenta cero entradas antes de una compra', async () => {
    await expect(repositorio.contarEntradas(compra.email, compra.fechaVisita)).resolves.toBe(0);
  });

  it('guarda la compra y una entrada por subtotal', async () => {
    const numeroOrden = await repositorio.guardar(compra);

    expect(numeroOrden).toMatch(/^ORD-/);
    expect(
      conexion.baseDatos.prepare('SELECT * FROM compras WHERE numero_orden = ?').get(numeroOrden),
    ).toMatchObject({
      email: compra.email,
      fecha_visita: '2026-10-20',
      forma_pago: 'TARJETA',
      total: 25000,
    });
    expect(
      conexion.baseDatos
        .prepare(
          'SELECT edad, tipo_pase, precio FROM entradas WHERE numero_orden = ? ORDER BY edad',
        )
        .all(numeroOrden),
    ).toEqual([
      { edad: 10, tipo_pase: 'REGULAR', precio: 5000 },
      { edad: 35, tipo_pase: 'VIP', precio: 20000 },
    ]);
    await expect(repositorio.contarEntradas(compra.email, compra.fechaVisita)).resolves.toBe(2);
  });

  it('revierte la compra completa si una entrada no se puede guardar', async () => {
    const invalida: NuevaCompra = {
      ...compra,
      detalle: {
        subtotales: [...compra.detalle.subtotales, { edad: -1, tipoPase: 'VIP', precio: 100 }],
        total: 25100,
      },
    };

    await expect(repositorio.guardar(invalida)).rejects.toThrow();
    expect(conexion.baseDatos.prepare('SELECT COUNT(*) cantidad FROM compras').get()).toEqual({
      cantidad: 0,
    });
  });
});
