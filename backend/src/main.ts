import { crearAplicacion } from './aplicacion';
import { leerConfiguracionBaseDatos } from './config/base-datos.config';
import { leerConfiguracionServidor } from './config/servidor.config';
import { leerConfiguracionSimulacion } from './config/simulacion.config';
import { cargarDatosIniciales } from './infraestructura/bd/datos-iniciales';
import { NotificadorSimulado } from './modules/compras/compras.notificador-simulado';
import { PasarelaPagoSimulada } from './modules/pagos/pagos.pasarela-simulada';
import { crearServidor } from './servidor-http';

const baseDatos = leerConfiguracionBaseDatos();
const servidorConfig = leerConfiguracionServidor();
const simulacion = leerConfiguracionSimulacion();
const aplicacion = crearAplicacion({
  ruta: baseDatos.ruta,
  pasarela: new PasarelaPagoSimulada(simulacion.urlPagoSimulado),
  notificador: new NotificadorSimulado(),
});
cargarDatosIniciales(aplicacion.conexion, simulacion.emailUsuarioRegistrado);

const servidor = crearServidor(aplicacion.controlador);
servidor.listen(servidorConfig.puerto, servidorConfig.host);

const cerrar = () => servidor.close(() => aplicacion.conexion.cerrar());
process.once('SIGINT', cerrar);
process.once('SIGTERM', cerrar);
