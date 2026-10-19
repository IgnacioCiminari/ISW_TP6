import { afterEach, describe, expect, it } from 'vitest';
import { ConexionSqlite } from '../../../src/infraestructura/bd/conexion-sqlite';

describe('ConexionSqlite', () => {
  let conexion: ConexionSqlite | undefined;

  afterEach(() => conexion?.cerrar());

  it('crea únicamente las tablas del modelo de compras', () => {
    conexion = new ConexionSqlite(':memory:');

    const tablas = conexion.baseDatos
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all()
      .map((fila) => (fila as { name: string }).name);

    expect(tablas).toEqual(['compras', 'entradas', 'usuarios']);
  });

  it('activa las claves foráneas', () => {
    conexion = new ConexionSqlite(':memory:');

    expect(() =>
      conexion?.baseDatos
        .prepare(
          `INSERT INTO compras
             (numero_orden, email, fecha_visita, forma_pago, total)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .run('ORD-1', 'inexistente@mail.com', '2026-10-20', 'EFECTIVO', 1000),
    ).toThrow();
  });
});
