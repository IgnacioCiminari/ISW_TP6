import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { armarMailConfirmacion } from '../../../src/modules/compras/compras.mail-confirmacion';
import type { MensajeMail, ResumenCompra } from '../../../src/modules/compras/compras.types';

const REMITENTE = 'EcoHarmony Park <ecoharmonypark1@gmail.com>';
const EMAIL = 'visitante@mail.com';

const RESUMEN: ResumenCompra = {
  numeroOrden: 'ORD-123',
  fechaVisita: new Date(2026, 9, 24), // sábado 24/10/2026
  cantidadEntradas: 3,
  formaPago: 'TARJETA',
  detalle: {
    subtotales: [
      { edad: 35, tipoPase: 'VIP', precio: 20000 },
      { edad: 10, tipoPase: 'REGULAR', precio: 5000 },
      { edad: 2, tipoPase: 'REGULAR', precio: 0 },
    ],
    total: 25000,
  },
  entradas: [
    { edad: 35, tipoPase: 'VIP', precio: 20000, codigoQR: 'QR-ORD-123-1' },
    { edad: 10, tipoPase: 'REGULAR', precio: 5000, codigoQR: 'QR-ORD-123-2' },
    { edad: 2, tipoPase: 'REGULAR', precio: 0, codigoQR: 'QR-ORD-123-3' },
  ],
};

const IMAGENES_QR = [Buffer.from('png-qr-1'), Buffer.from('png-qr-2'), Buffer.from('png-qr-3')];

const armar = (resumen: ResumenCompra = RESUMEN) =>
  armarMailConfirmacion({
    remitente: REMITENTE,
    para: EMAIL,
    resumen,
    imagenesQR: IMAGENES_QR,
  });

// El contenido tiene que estar tanto en la versión HTML como en la de texto plano.
const cuerpos = (mail: MensajeMail): string[] => [mail.html, mail.texto];

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

  it('incluye el número de orden y la fecha de visita en formato largo', () => {
    const mail = armar();

    for (const cuerpo of cuerpos(mail)) {
      expect(cuerpo).toContain('ORD-123');
      expect(cuerpo).toContain('sábado, 24 de octubre de 2026');
    }
  });

  it('detalla cada entrada con su edad, tipo de pase y subtotal', () => {
    const mail = armar();

    for (const cuerpo of cuerpos(mail)) {
      expect(cuerpo).toMatch(/35 años.*VIP.*\$\s?20\.000/s);
      expect(cuerpo).toMatch(/10 años.*Regular.*\$\s?5\.000/s);
      expect(cuerpo).toMatch(/2 años.*Regular.*Gratis/s);
    }
  });

  it('incluye el total de la compra', () => {
    const mail = armar();

    for (const cuerpo of cuerpos(mail)) expect(cuerpo).toMatch(/Total.*\$\s?25\.000/s);
  });

  it.each([
    ['TARJETA', 'Mercado Pago'],
    ['EFECTIVO', 'boletería'],
  ] as const)('con pago %s lo indica como %s', (formaPago, textoEsperado) => {
    const mail = armar({ ...RESUMEN, formaPago });

    for (const cuerpo of cuerpos(mail)) expect(cuerpo).toContain(textoEsperado);
  });

  // En Docker el proceso corre en UTC: la fecha de visita es un día de calendario y no se corre.
  describe('con el proceso en UTC', () => {
    const zonaOriginal = process.env.TZ;

    beforeEach(() => {
      process.env.TZ = 'UTC';
    });

    afterEach(() => {
      if (zonaOriginal === undefined) delete process.env.TZ;
      else process.env.TZ = zonaOriginal;
    });

    it('muestra la misma fecha de visita', () => {
      const mail = armar({ ...RESUMEN, fechaVisita: new Date(2026, 9, 24) });

      expect(mail.texto).toContain('sábado, 24 de octubre de 2026');
    });
  });
});
