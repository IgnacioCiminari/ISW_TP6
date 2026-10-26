// El login queda fuera de la US (FAQ 19): la sesión se mockea con el usuario registrado
// que el backend carga en sus datos iniciales (EMAIL_DEMO del .env).
export interface UsuarioSesion {
  email: string;
}

export const USUARIO_SESION: UsuarioSesion = {
  email: import.meta.env.EMAIL_DEMO,
};
