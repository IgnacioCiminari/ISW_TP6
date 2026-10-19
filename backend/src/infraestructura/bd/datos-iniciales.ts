import type { ConexionSqlite } from './conexion-sqlite';

export const cargarDatosIniciales = (conexion: ConexionSqlite, email: string): void => {
  conexion.baseDatos.prepare('INSERT OR IGNORE INTO usuarios(email) VALUES (?)').run(email);
};
