// Editar estos valores para ejecutar el backend localmente.
export const configuracion = {
  baseDatos: {
    ruta: './bd/data/parque.sqlite',
  },
  servidor: {
    host: '127.0.0.1',
    puerto: 3000,
  },
  simulacion: {
    urlPagoSimulado: 'https://pago.simulado/checkout',
    emailUsuarioRegistrado: 'visitante@mail.com',
  },
} as const;
