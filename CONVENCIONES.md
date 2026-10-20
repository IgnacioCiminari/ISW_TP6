# EcoHarmony Park • Bioparque — Guía de Estilos

## 1. Guía de Estilos UI/UX (Frontend • React)

La aplicación está orientada a los visitantes del parque, por lo que la interfaz debe ser amigable, rápida y adaptable a celulares. El cliente pidió una app mobile; se entrega como web responsive.

- **Enfoque de diseño:** Mobile First. Se diseña primero para pantallas de celular y se amplía hacia tablet y escritorio.
- **Logotipo:** el logo «EcoHarmony Park – Bioparque» (diseño circular) lo diseña el grupo y debe ser validado por el PO antes de la entrega (FAQ 17). Hasta entonces se usa la propuesta del grupo como provisoria.
- **Tipografía:** Lato en toda la aplicación (títulos, párrafos, botones, formularios, mensajes de error y modales). Pesos permitidos: 400 (regular) y 700 (negrita). Se declara con alternativa:

  ```css
  font-family: Lato, system-ui, sans-serif;
  ```

- **Tecnología de estilos:** Tailwind CSS v4, con los colores de la paleta definidos una sola vez en el bloque `@theme` de `src/shared/styles/index.css`, que los publica como variables CSS en `:root`. No se escriben códigos hexadecimales sueltos en los componentes.

### 1.1 Paleta de colores oficial

Los colores los define el Product Owner (FAQ 3). Se agrega el blanco `#FFFFFF` como superficie neutra de tarjetas y modales, necesario para cumplir el contraste de los mensajes de error, y tres tonos derivados de la paleta para filetes y texto (ver tabla).

| Color | Hex | Variable CSS | Uso |
|---|---|---|---|
| Verde Oscuro | `#386641` | `--color-primario` | Principal. Header, barra de navegación, texto principal y botón de acción principal («Confirmar compra», «Pagar») con texto blanco. |
| Verde Medio | `#6a994e` | `--color-secundario` | Íconos destacados, estados hover/pressed del botón principal, ilustraciones y botones secundarios con borde (texto en verde oscuro). No se usa como fondo de texto blanco de tamaño normal. |
| Verde Claro | `#a7c957` | `--color-acento` | Acento decorativo: resaltar la selección (por ejemplo, entradas seleccionadas) como relleno o indicador, siempre acompañado de borde o ícono en verde oscuro. No se usa para texto. |
| Crema / Beige | `#f2e8cf` | `--color-fondo` | Fondo principal de pantallas y contenedores de formularios, para reducir la fatiga visual. |
| Rojo Tierra | `#bc4749` | `--color-alerta` | Exclusivo para validaciones fallidas (por ejemplo, «La cantidad de entradas requeridas no debe ser mayor a 10») y para botones de cancelar. |
| Blanco | `#ffffff` | `--color-superficie` | Superficie neutra de tarjetas, modales y mensajes de error. Texto sobre fondos oscuros. |
| Renglón *(derivado)* | `#e3d8ba` | `--color-renglon` | Filetes de 1px entre filas y bordes de los días disponibles del calendario. |
| Tinta *(derivado)* | `#1f3a25` | `--color-tinta` | Texto de cuerpo. El verde oscuro queda para títulos, totales y acciones. |
| Tinta suave *(derivado)* | `#4b5a44` | `--color-tinta-suave` | Texto secundario, etiquetas y días no disponibles. |

```css
:root {
  --color-primario: #386641;
  --color-secundario: #6a994e;
  --color-acento: #a7c957;
  --color-fondo: #f2e8cf;
  --color-alerta: #bc4749;
  --color-superficie: #ffffff;

  --color-renglon: #e3d8ba;
  --color-tinta: #1f3a25;
  --color-tinta-suave: #4b5a44;
}
```

### 1.3 Layout y componentes

- **Calendario de visita:** los días en que el parque está cerrado (lunes, 25/12 y 1/1) y las fechas fuera del rango permitido se muestran deshabilitados, no seleccionables (FAQ 2). Las fechas permitidas van desde hoy hasta un mes adelante (FAQ 25).
- **Simulaciones:** la redirección a Mercado Pago se simula con una pantalla de «Compra exitosa» y el envío de mail con un modal «Mail enviado a …» (FAQ 4 y 5). Ambas respetan esta guía visual.
- **Organización del frontend:** por funcionalidad, no por tipo de archivo.

  | Carpeta | Contenido |
  |---|---|
  | `src/app` | Shell de la aplicación (header y `<main>`) |
  | `src/modules/<funcionalidad>` | Página, hook y componentes de una funcionalidad (`modules/compra`) |
  | `src/shared/http` | Llamadas a la API |
  | `src/shared/sesion` | Usuario de la sesión simulada |
  | `src/shared/styles` | Estilos y tokens |
  | `src/shared/ui` | Componentes y formatos reutilizables |

  Los componentes se nombran en PascalCase (`FichaVisita.tsx`), las páginas con sufijo `Page` (`CompraPage.tsx`) y los hooks con prefijo `use` (`useCompra.ts`).
- **Tamaño táctil:** los controles miden 44px o más. En grillas densas, como los días del calendario en un celular angosto, se acepta un mínimo de 24px (WCAG 2.2 AA, criterio 2.5.8).

---

## 2. Guía de Estilos de Código (TypeScript y Node.js)

Para mantener la consistencia en los módulos de parque, pagos y compras, todo el equipo sigue estas reglas.

### 2.1 Idioma y nomenclatura

- **Idioma:** el dominio se nombra en español (`comprarEntradas`, `ParqueService`, `SolicitudCompra`); los términos técnicos y sufijos, en inglés (`Service`, `types`, `test`). Los comentarios y mensajes de error van en español.
- **Archivos:** los módulos de dominio usan `<modulo>.<rol>.ts` en minúsculas (`parque.service.ts`, `pagos.types.ts`, `compras.service.test.ts`). La infraestructura y el arranque van en `kebab-case.ts` (`servidor-http.ts`, `conexion-sqlite.ts`) y los fakes de test con sufijo en español (`notificador.falso.ts`).
- **Clases, interfaces y tipos:** PascalCase (`ParqueService`, `SolicitudCompra`, `ResultadoCompra`). Las interfaces no llevan prefijo `I` (`PasarelaPago`, `Notificador`).
- **Métodos y variables:** camelCase (`comprarEntradas`, `validarFechaVisita`, `procesarPago`). Los booleanos se leen como pregunta (`estaAbierto`, `tieneCupo`). En el estado de React y en las props se aceptan adjetivos que se leen naturalmente en JSX (`abierta`, `enviando`).
- **Constantes:** UPPER_SNAKE_CASE (`MAX_ENTRADAS = 10`, `PRECIO_VIP`, `HORA_LIMITE_COMPRA`). No se dejan «números mágicos»: todo valor del negocio (precios, edades de descuento, límites de horario) es una constante con nombre.

| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivos de dominio | `<modulo>.<rol>.ts`, minúsculas | `parque.service.ts` |
| Infraestructura y arranque | `kebab-case.ts` | `servidor-http.ts` |
| Clases, interfaces, tipos | PascalCase, sin prefijo `I` | `SolicitudCompra`, `PasarelaPago` |
| Métodos y variables | camelCase | `validarFechaVisita` |
| Booleanos | Forma de pregunta (adjetivos en estado y props de React) | `estaAbierto`, `tieneCupo` |
| Constantes | UPPER_SNAKE_CASE | `MAX_ENTRADAS` |
| Componentes React | PascalCase `.tsx` | `FormularioCompra.tsx` |
| Hooks | Prefijo `use` | `useCompra.ts` |

### 2.2 Estructura y arquitectura

- **Inyección de dependencias:** los servicios no instancian a sus colaboradores. Repositorios, reloj (`ahora`), notificador (mail) y pasarela de Mercado Pago se inyectan por constructor.
- **Separación de responsabilidades:** las interfaces y los tipos compartidos viven en archivos específicos (`compras.types.ts`, `pagos.types.ts`). La forma de la respuesta HTTP (`RespuestaCompraHttp`) vive en el controller, que es quien la arma; los puertos que ya están en `DependenciasCompras` se nombran a partir de ahí (`DependenciasCompras['notificador']`). Si hay que modificar un contrato compartido, se avisa al equipo antes y se actualizan los tests en el mismo PR.
- **Tipado estricto:** firmas y objetos de retorno siempre tipados (por ejemplo `procesarPago(...): Promise<ResultadoPago>`). Está prohibido `any`; si el tipo es desconocido se usa `unknown` y se acota.
- **Dinero:** los importes se manejan como números enteros en pesos argentinos (ARS), sin decimales. Los descuentos se calculan sobre enteros. Con los precios actuales el factor de media entrada da siempre enteros, así que no hay redondeo; si un precio o un factor nuevo lo necesitara, se define en un único lugar.
- **Fechas y horarios:** toda regla horaria (cierre de compra del mismo día a las 17:30, horario del parque) se evalúa en la zona horaria `America/Argentina/Cordoba`, con `Intl` y sin depender de la zona del proceso. Las reglas reciben la fecha actual por el parámetro `ahora`; solo el borde lee el reloj (`validarFechaVisita` usa `new Date()` cuando no se le pasa), y los tests siempre lo pasan explícito.
- **Funciones:** cada método hace una sola cosa y las validaciones van al principio, antes de modificar estado o llamar a servicios externos.

### 2.3 Formato y verificación automática

Las reglas que se pueden verificar con una herramienta se verifican con una herramienta, no a ojo.

| Herramienta | Configuración acordada |
|---|---|
| TypeScript | `"strict": true` en `tsconfig.json`. `npm run typecheck` debe terminar sin errores. |
| oxlint | `no-explicit-any` en error, además de `no-unused-vars` y `eqeqeq` (`.oxlintrc.json`). `npm run lint` debe pasar. Reemplaza a ESLint mientras `typescript-eslint` no soporte TypeScript 7. |
| Prettier | 2 espacios de indentación, comillas simples, punto y coma, coma final en estructuras multilínea y ancho máximo de 100 caracteres (`.prettierrc.json`). `npm run format:check` debe pasar. |
| Vitest | `npm test` debe pasar completo. `npm run test:coverage` exige al menos 90 % de líneas en los tres servicios. |

Antes de abrir un Pull Request se corre, en este orden, en cada carpeta que toque el PR:

```bash
# backend
npm run typecheck
npm run lint
npm run format:check
npm test

# frontend
npm run lint
npm run format:check
npm run build
```

> Un PR con alguno de estos comandos en rojo **no se mergea**.

### 2.4 Git: ramas y commits

- **Ramas:** una por paquete de trabajo, con el formato `tp6/pN-nombre` (por ejemplo `tp6/p3-tarifas`). Los cambios que no son un paquete de TDD (frontend, configuración, documentación) usan `tp6/<nombre>`, sin número.
- **Commits:** un commit por cada paso del ciclo, con prefijo y paquete: `red(P3): ...`, `green(P3): ...`, `refactor(P3): ...`. El mensaje describe el comportamiento, por ejemplo `green(P3): el pase VIP cuesta $20.000`.
- **Commits fuera del ciclo:** llevan un prefijo de tipo sin paquete: `config:`, `feat:`, `fix:`, `refactor:`, `style:` (solo formato), `test:` (tests sin código de producción) o `docs:`.
- **Pull requests:** se abre un PR a `main` cuando el paquete completo está en verde. Cada integrante toca solo los archivos de su módulo.

---

## 3. Convenciones para TDD (Testing)

El backend de la US «Comprar entradas» se desarrolla estrictamente con Test-Driven Development. El frontend no tiene tests: se verifica con `npm run build` y probándolo contra la API.

### 3.1 Organización de los tests

- Los tests unitarios terminan en `.test.ts` y se ubican en `test/` (`parque.service.test.ts`, `pagos.service.test.ts`, `compras.service.test.ts`).
- Los tests prueban cada servicio de forma aislada. Las dependencias externas (Mercado Pago, mails, base de datos) se reemplazan por fakes o mocks (por ejemplo, `vi.fn()`).
- Los tests que integran los servicios reales para cubrir los escenarios de usuario van en `compras.integracion.test.ts`; los que además levantan HTTP y SQLite en memoria van en `test/modules/compras/compras.http.integracion.test.ts`. Los tests de infraestructura y adaptadores repiten la ruta de `src/` bajo `test/`.
- **Estructura:** un `describe` raíz por clase o por US y, adentro, uno por método. Un `it` por comportamiento, con una frase en español en presente (con «debe» o sin él). Cada test sigue el patrón Arrange-Act-Assert, con las tres partes separadas por una línea en blanco.

```ts
describe('ComprasService', () => {
  describe('comprarEntradas', () => {
    it('rechaza la compra de más de 10 entradas', async () => {
      const deps = crearDependencias();
      const servicio = new ComprasService(deps);

      const compra = servicio.comprarEntradas(solicitudValida({ cantidad: 11 }));

      await expect(compra).rejects.toThrow('No se pueden comprar más de 10 entradas.');
    });
  });
});
```

### 3.2 Ciclo Red-Green-Refactor

El historial de Git debe reflejar claramente el proceso de TDD, por eso son obligatorios los commits estructurados (ver [2.4](#24-git-ramas-y-commits)).

| Paso | Qué se hace | Commit |
|---|---|---|
| **RED** | Escribir un test y ejecutarlo (`npx vitest`). Confirmar que falla por el motivo correcto: el comportamiento no está implementado, no un error de sintaxis o de importación. | `red(Pn): ...` |
| **GREEN** | Escribir el código mínimo e indispensable para que el test pase. Sin anticipar casos que ningún test pide todavía. | `green(Pn): ...` |
| **REFACTOR** | Mejorar nombres, quitar duplicación y extraer constantes, con todos los tests en verde y sin cambiar el comportamiento. | `refactor(Pn): ...` |

Si un test nuevo pasa sin cambiar código, no se commitea como RED: va en un solo commit que lo aclara en el mensaje.
