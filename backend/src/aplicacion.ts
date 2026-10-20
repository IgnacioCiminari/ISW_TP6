import type { PasarelaPago } from './modules/pagos/pagos.types';
import { CompraController } from './modules/compras/compras.controller';
import { SqliteComprasRepository } from './modules/compras/compras.repository';
import type { DependenciasCompras } from './modules/compras/compras.types';
import { ComprasService } from './modules/compras/compras.service';
import { PagosService } from './modules/pagos/pagos.service';
import { ParqueService } from './modules/parque/parque.service';
import { SqliteUsuariosRepository } from './modules/usuarios/usuarios.repository';
import { ConexionSqlite } from './infraestructura/bd/conexion-sqlite';

type Notificador = DependenciasCompras['notificador'];

export const crearAplicacion = ({
  ruta,
  pasarela,
  notificador,
}: {
  ruta: string;
  pasarela: PasarelaPago;
  notificador: Notificador;
}): { conexion: ConexionSqlite; controlador: CompraController } => {
  const conexion = new ConexionSqlite(ruta);
  const comprasService = new ComprasService({
    usuarios: new SqliteUsuariosRepository(conexion),
    compras: new SqliteComprasRepository(conexion),
    parque: new ParqueService(),
    pagos: new PagosService(pasarela),
    notificador,
  });

  return { conexion, controlador: new CompraController(comprasService) };
};
