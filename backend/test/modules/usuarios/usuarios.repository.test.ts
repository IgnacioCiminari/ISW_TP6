import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ConexionSqlite } from '../../../src/infraestructura/bd/conexion-sqlite';
import { SqliteUsuariosRepository } from '../../../src/modules/usuarios/usuarios.repository';

describe('SqliteUsuariosRepository', () => {
  let conexion: ConexionSqlite;
  let repositorio: SqliteUsuariosRepository;

  beforeEach(() => {
    conexion = new ConexionSqlite(':memory:');
    repositorio = new SqliteUsuariosRepository(conexion);
    conexion.baseDatos.prepare('INSERT INTO usuarios(email) VALUES (?)').run('registrado@mail.com');
  });

  afterEach(() => conexion.cerrar());

  it('reconoce un usuario registrado', async () => {
    await expect(repositorio.estaRegistrado('registrado@mail.com')).resolves.toBe(true);
  });

  it('rechaza un email inexistente', async () => {
    await expect(repositorio.estaRegistrado('otro@mail.com')).resolves.toBe(false);
  });
});
