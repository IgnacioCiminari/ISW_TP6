import QRCode from 'qrcode';

export const generarImagenQR = (codigo: string): Promise<Buffer> => QRCode.toBuffer(codigo);
