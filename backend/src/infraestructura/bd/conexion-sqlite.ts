import { DatabaseSync } from 'node:sqlite';
import { aplicarEsquema } from './esquema-sqlite';

export class ConexionSqlite {
  readonly baseDatos: DatabaseSync;

  constructor(ruta: string) {
    this.baseDatos = new DatabaseSync(ruta);
    this.baseDatos.exec('PRAGMA foreign_keys = ON');
    aplicarEsquema(this.baseDatos);
  }

  cerrar(): void {
    this.baseDatos.close();
  }
}
