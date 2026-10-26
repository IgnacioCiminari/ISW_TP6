import { describe, expect, it } from 'vitest';
import { generarImagenQR } from '../../../src/modules/compras/compras.qr';
import { leerQR } from '../../helpers/leer-qr';

// Los primeros 8 bytes de todo archivo PNG.
const FIRMA_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe('generarImagenQR', () => {
  it('genera una imagen PNG', async () => {
    const imagen = await generarImagenQR('QR-ORD-123-1');

    expect(imagen.subarray(0, FIRMA_PNG.length)).toEqual(FIRMA_PNG);
  });

  it('el QR generado se lee con el mismo código', async () => {
    const imagen = await generarImagenQR('QR-ORD-123-1');

    expect(leerQR(imagen)).toBe('QR-ORD-123-1');
  });
});
