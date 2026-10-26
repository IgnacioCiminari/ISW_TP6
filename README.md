# ISW_TP6
Este repositorio se crea con el único fin de realizar el Trabajo Práctico 6 del Grupo 1 de Ingeniería y Calidad de Software 4K1.

## Mail de confirmación

Al confirmar una compra, el backend envía al comprador un mail con el número de orden, la fecha de visita, la forma de pago, el detalle de cada entrada con su subtotal, el total y **un código QR por entrada** (FAQ 18 y respuesta del PO).

El envío usa SMTP. Si no hay credenciales configuradas, el backend arranca igual y el mail se simula sin enviarse.

### Configuración

1. Copiar la plantilla en la raíz del repositorio:

   ```bash
   cp .env.example .env
   ```

2. Completar el `.env`. **No se commitea**: está en `.gitignore`.

   | Variable | Qué es |
   |---|---|
   | `EMAIL_DEMO` | Usuario registrado de la sesión simulada y destinatario del mail en la demo. El backend lo carga en la base y el frontend lo usa como sesión. |
   | `SMTP_HOST` / `SMTP_PUERTO` | Servidor SMTP. Con Brevo: `smtp-relay.brevo.com` y `587`. |
   | `SMTP_USUARIO` / `SMTP_CLAVE` | Login y clave SMTP. En Brevo: *SMTP & API → SMTP* (la clave es la *SMTP key*, no la contraseña de la cuenta). |
   | `MAIL_REMITENTE` | `EcoHarmony Park <ecoharmonypark1@gmail.com>`. Tiene que ser un remitente verificado en el proveedor. |

### Cómo correrlo

- **Local:** `npm start` en `backend/` carga el `.env` de la raíz. `npm run dev` en `frontend/` toma `EMAIL_DEMO` del mismo archivo.
- **Docker:** `docker compose up --build`. El backend lee el `.env` y el frontend recibe `EMAIL_DEMO` en el build. La app queda en http://localhost:8080.

Si cambiás `EMAIL_DEMO`, reiniciá el backend (y en Docker, volvé a construir con `--build`). Los usuarios cargados antes no se borran.

### Si el mail no llega

- La API responde `Error interno.` y el detalle queda en la consola del backend (`docker compose logs backend` en Docker).
- `self-signed certificate in certificate chain`: un antivirus está interceptando el SMTP. En Avast se soluciona desactivando *Mail Shield → Analizar correos salientes (SMTP)*.
- `Invalid login`: el usuario o la clave SMTP están mal.
- Si no aparece en la bandeja de entrada, revisar spam. En Brevo, *Transactional → Logs* muestra si cada mail se entregó o rebotó.
