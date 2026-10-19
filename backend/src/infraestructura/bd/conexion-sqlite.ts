import { DatabaseSync } from 'node:sqlite';

export class ConexionSqlite {
  readonly baseDatos: DatabaseSync;

  constructor(ruta: string) {
    this.baseDatos = new DatabaseSync(ruta);
    this.baseDatos.exec(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS usuarios (
        email TEXT PRIMARY KEY
      );

      CREATE TABLE IF NOT EXISTS compras (
        numero_orden TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        fecha_visita TEXT NOT NULL,
        forma_pago TEXT NOT NULL CHECK (forma_pago IN ('EFECTIVO', 'TARJETA')),
        total INTEGER NOT NULL CHECK (total >= 0),
        FOREIGN KEY (email) REFERENCES usuarios(email)
      );

      CREATE TABLE IF NOT EXISTS entradas (
        numero_orden TEXT NOT NULL,
        edad INTEGER NOT NULL CHECK (edad >= 0),
        tipo_pase TEXT NOT NULL CHECK (tipo_pase IN ('VIP', 'REGULAR')),
        precio INTEGER NOT NULL CHECK (precio >= 0),
        FOREIGN KEY (numero_orden) REFERENCES compras(numero_orden) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_compras_email_fecha
        ON compras(email, fecha_visita);
      CREATE INDEX IF NOT EXISTS idx_entradas_numero_orden
        ON entradas(numero_orden);
    `);
  }

  cerrar(): void {
    this.baseDatos.close();
  }
}
