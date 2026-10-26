import QRCode from 'qrcode';

/** Imagen PNG del QR que codifica `codigo`. */
export const generarImagenQR = (codigo: string): Promise<Buffer> => QRCode.toBuffer(codigo);
