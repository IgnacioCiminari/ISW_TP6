import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';
import { generarImagenQR } from '../../../src/modules/compras/compras.qr';

// Los primeros 8 bytes de todo archivo PNG.
const FIRMA_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const leerQR = (imagen: Buffer): string | undefined => {
  const png = PNG.sync.read(imagen);
  return jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data;
};

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
