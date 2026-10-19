import { randomUUID } from 'node:crypto';
import type { ConexionSqlite } from '../../infraestructura/bd/conexion-sqlite';
import type { NuevaCompra } from './compras.types';

const formatearFechaSql = (fecha: Date): string =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;

export class SqliteComprasRepository {
  constructor(private readonly conexion: ConexionSqlite) {}

  async contarEntradas(email: string, fecha: Date): Promise<number> {
    const fechaSql = formatearFechaSql(fecha);
    const fila = this.conexion.baseDatos
      .prepare(
        `SELECT COUNT(*) cantidad
         FROM entradas e
         JOIN compras c ON c.numero_orden = e.numero_orden
         WHERE c.email = ? AND c.fecha_visita = ?`,
      )
      .get(email, fechaSql) as { cantidad: number };

    return fila.cantidad;
  }

  async guardar(compra: NuevaCompra): Promise<string> {
    const numeroOrden = `ORD-${randomUUID()}`;
    const fechaSql = formatearFechaSql(compra.fechaVisita);
    const baseDatos = this.conexion.baseDatos;

    baseDatos.exec('BEGIN');
    try {
      baseDatos
        .prepare(
          `INSERT INTO compras
             (numero_orden, email, fecha_visita, forma_pago, total)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .run(numeroOrden, compra.email, fechaSql, compra.formaPago, compra.detalle.total);

      const insertarEntrada = baseDatos.prepare(
        `INSERT INTO entradas (numero_orden, edad, tipo_pase, precio)
         VALUES (?, ?, ?, ?)`,
      );
      for (const subtotal of compra.detalle.subtotales) {
        insertarEntrada.run(numeroOrden, subtotal.edad, subtotal.tipoPase, subtotal.precio);
      }

      baseDatos.exec('COMMIT');
      return numeroOrden;
    } catch (error) {
      baseDatos.exec('ROLLBACK');
      throw error;
    }
  }
}
