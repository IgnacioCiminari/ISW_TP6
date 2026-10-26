import jsQR from 'jsqr';
import { PNG } from 'pngjs';

// Decodifica un PNG con un QR y devuelve su contenido, o undefined si no se puede leer.
export const leerQR = (imagen: Buffer): string | undefined => {
  const png = PNG.sync.read(imagen);
  return jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data;
};
