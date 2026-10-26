import nodemailer from 'nodemailer';
import { crearAplicacion } from './aplicacion';
import { leerConfiguracionBaseDatos } from './config/base-datos.config';
import { leerConfiguracionMail } from './config/mail.config';
import { leerConfiguracionServidor } from './config/servidor.config';
import { leerConfiguracionSimulacion } from './config/simulacion.config';
import { cargarDatosIniciales } from './infraestructura/bd/datos-iniciales';
import { NotificadorMail } from './modules/compras/compras.notificador-mail';
import { NotificadorSimulado } from './modules/compras/compras.notificador-simulado';
import { TransporteSmtp } from './modules/compras/compras.transporte-smtp';
import { PasarelaPagoSimulada } from './modules/pagos/pagos.pasarela-simulada';
import { crearServidor } from './servidor-http';

// En el puerto 465 la conexión es TLS desde el inicio; en 587 se negocia con STARTTLS.
const PUERTO_SMTP_TLS = 465;

const baseDatos = leerConfiguracionBaseDatos();
const servidorConfig = leerConfiguracionServidor();
const simulacion = leerConfiguracionSimulacion();
const mail = leerConfiguracionMail();

// Sin servidor SMTP configurado (sin .env) el mail se sigue simulando.
const notificador = mail.host
  ? new NotificadorMail(
      new TransporteSmtp(
        nodemailer.createTransport({
          host: mail.host,
          port: mail.puerto,
          secure: mail.puerto === PUERTO_SMTP_TLS,
          auth: { user: mail.usuario, pass: mail.clave },
        }),
      ),
      mail.remitente,
    )
  : new NotificadorSimulado();

const aplicacion = crearAplicacion({
  ruta: baseDatos.ruta,
  pasarela: new PasarelaPagoSimulada(simulacion.urlPagoSimulado),
  notificador,
});
cargarDatosIniciales(aplicacion.conexion, simulacion.emailUsuarioRegistrado);

const servidor = crearServidor(aplicacion.controlador);
servidor.listen(servidorConfig.puerto, servidorConfig.host);

const cerrar = () => servidor.close(() => aplicacion.conexion.cerrar());
process.once('SIGINT', cerrar);
process.once('SIGTERM', cerrar);
