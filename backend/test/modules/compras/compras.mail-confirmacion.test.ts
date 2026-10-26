import { describe, expect, it } from 'vitest';
import { armarMailConfirmacion } from '../../../src/modules/compras/compras.mail-confirmacion';
import type { ResumenCompra } from '../../../src/modules/compras/compras.types';

const REMITENTE = 'EcoHarmony Park <ecoharmonypark1@gmail.com>';
const EMAIL = 'visitante@mail.com';

const RESUMEN: ResumenCompra = {
  numeroOrden: 'ORD-123',
  fechaVisita: new Date(2026, 9, 24), // sábado 24/10/2026
  cantidadEntradas: 2,
  formaPago: 'TARJETA',
  detalle: {
    subtotales: [
      { edad: 35, tipoPase: 'VIP', precio: 20000 },
      { edad: 2, tipoPase: 'REGULAR', precio: 0 },
    ],
    total: 20000,
  },
  entradas: [
    { edad: 35, tipoPase: 'VIP', precio: 20000, codigoQR: 'QR-ORD-123-1' },
    { edad: 2, tipoPase: 'REGULAR', precio: 0, codigoQR: 'QR-ORD-123-2' },
  ],
};

const IMAGENES_QR = [Buffer.from('png-qr-1'), Buffer.from('png-qr-2')];

const armar = (resumen: ResumenCompra = RESUMEN) =>
  armarMailConfirmacion({
    remitente: REMITENTE,
    para: EMAIL,
    resumen,
    imagenesQR: IMAGENES_QR,
  });

describe('armarMailConfirmacion', () => {
  it('va dirigido al comprador desde el remitente del parque', () => {
    const mail = armar();

    expect(mail.para).toBe(EMAIL);
    expect(mail.de).toBe(REMITENTE);
  });

  it('el asunto incluye el número de orden', () => {
    const mail = armar();

    expect(mail.asunto).toContain('ORD-123');
  });
});
