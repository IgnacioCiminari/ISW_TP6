import type { ConexionSqlite } from '../../infraestructura/bd/conexion-sqlite';

export class SqliteUsuariosRepository {
  constructor(private readonly conexion: ConexionSqlite) {}

  async estaRegistrado(email: string): Promise<boolean> {
    return this.conexion.baseDatos.prepare('SELECT 1 FROM usuarios WHERE email = ?').get(email) !== undefined;
  }
}
