# EcoHarmony Park • Bioparque — Guía de Estilos

## 1. Guía de Estilos UI/UX (Frontend • React)

La aplicación está orientada a los visitantes del parque, por lo que la interfaz debe ser amigable, rápida y adaptable a celulares. El cliente pidió una app mobile; se entrega como web responsive.

- **Enfoque de diseño:** Mobile First. Se diseña primero para pantallas de celular y se amplía hacia tablet y escritorio.
- **Logotipo:** el logo «EcoHarmony Park – Bioparque» (diseño circular) lo diseña el grupo y debe ser validado por el PO antes de la entrega (FAQ 17). Hasta entonces se usa la propuesta del grupo como provisoria.
- **Tipografía:** Lato en toda la aplicación (títulos, párrafos, botones, formularios, mensajes de error y modales). Pesos permitidos: 400 (regular) y 700 (negrita). Se declara con alternativa:

  ```css
  font-family: Lato, system-ui, sans-serif;
  ```

- **Tecnología de estilos:** Tailwind CSS, con los colores de la paleta definidos una sola vez como variables CSS en `:root` y mapeados en la configuración de Tailwind. No se escriben códigos hexadecimales sueltos en los componentes.

### 1.1 Paleta de colores oficial

Los colores los define el Product Owner (FAQ 3). Se agrega el blanco `#FFFFFF` únicamente como superficie neutra de tarjetas y modales, necesario para cumplir el contraste de los mensajes de error.

| Color | Hex | Variable CSS | Uso |
|---|---|---|---|
| Verde Oscuro | `#386641` | `--color-primario` | Principal. Header, barra de navegación, texto principal y botón de acción principal («Confirmar compra», «Pagar») con texto blanco. |
| Verde Medio | `#6a994e` | `--color-secundario` | Íconos destacados, estados hover/pressed del botón principal, ilustraciones y botones secundarios con borde (texto en verde oscuro). No se usa como fondo de texto blanco de tamaño normal. |
| Verde Claro | `#a7c957` | `--color-acento` | Acento decorativo: resaltar la selección (por ejemplo, entradas seleccionadas) como relleno o indicador, siempre acompañado de borde o ícono en verde oscuro. No se usa para texto. |
| Crema / Beige | `#f2e8cf` | `--color-fondo` | Fondo principal de pantallas y contenedores de formularios, para reducir la fatiga visual. |
| Rojo Tierra | `#bc4749` | `--color-alerta` | Exclusivo para validaciones fallidas (por ejemplo, «La cantidad de entradas requeridas no debe ser mayor a 10») y para botones de cancelar. |
| Blanco | `#ffffff` | `--color-superficie` | Superficie neutra de tarjetas, modales y mensajes de error. Texto sobre fondos oscuros. |

```css
:root {
  --color-primario: #386641;
  --color-secundario: #6a994e;
  --color-acento: #a7c957;
  --color-fondo: #f2e8cf;
  --color-alerta: #bc4749;
  --color-superficie: #ffffff;
}
```

### 1.3 Layout y componentes

- **Calendario de visita:** los días en que el parque está cerrado (lunes, 25/12 y 1/1) y las fechas fuera del rango permitido se muestran deshabilitados, no seleccionables (FAQ 2). Las fechas permitidas van desde hoy hasta un mes adelante (FAQ 25).
- **Simulaciones:** la redirección a Mercado Pago se simula con una pantalla de «Compra exitosa» y el envío de mail con un modal «Mail enviado a …» (FAQ 4 y 5). Ambas respetan esta guía visual.
- **Organización del frontend:**

  | Carpeta | Contenido |
  |---|---|
  | `src/components` | Componentes reutilizables |
  | `src/pages` | Pantallas |
  | `src/hooks` | Hooks |
  | `src/services` | Llamadas a la API |
  | `src/styles` | Estilos |

  Los componentes se nombran en PascalCase (`FormularioCompra.tsx`) y los hooks con prefijo `use` (`useCompra.ts`).

---

## 2. Guía de Estilos de Código (TypeScript y Node.js)

Para mantener la consistencia en los módulos de parque, pagos y compras, todo el equipo sigue estas reglas.

### 2.1 Idioma y nomenclatura

- **Idioma:** el dominio se nombra en español (`comprarEntradas`, `ParqueService`, `SolicitudCompra`); los términos técnicos y sufijos, en inglés (`Service`, `types`, `test`). Los comentarios y mensajes de error van en español.
- **Archivos:** `<modulo>.<rol>.ts` en minúsculas, que reflejan su propósito y su módulo (`parque.service.ts`, `pagos.types.ts`, `compras.service.test.ts`).
- **Clases, interfaces y tipos:** PascalCase (`ParqueService`, `SolicitudCompra`, `ResultadoCompra`). Las interfaces no llevan prefijo `I` (`PasarelaPago`, `Notificador`).
- **Métodos y variables:** camelCase (`comprarEntradas`, `validarFechaVisita`, `procesarPago`). Los booleanos se leen como pregunta (`estaAbierto`, `tieneCupo`).
- **Constantes:** UPPER_SNAKE_CASE (`MAX_ENTRADAS = 10`, `PRECIO_VIP`, `HORA_LIMITE_COMPRA`). No se dejan «números mágicos»: todo valor del negocio (precios, edades de descuento, límites de horario) es una constante con nombre.

| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivos | `<modulo>.<rol>.ts`, minúsculas | `parque.service.ts` |
| Clases, interfaces, tipos | PascalCase, sin prefijo `I` | `SolicitudCompra`, `PasarelaPago` |
| Métodos y variables | camelCase | `validarFechaVisita` |
| Booleanos | Forma de pregunta | `estaAbierto`, `tieneCupo` |
| Constantes | UPPER_SNAKE_CASE | `MAX_ENTRADAS` |
| Componentes React | PascalCase `.tsx` | `FormularioCompra.tsx` |
| Hooks | Prefijo `use` | `useCompra.ts` |

### 2.2 Estructura y arquitectura

- **Inyección de dependencias:** los servicios no instancian a sus colaboradores. Repositorios, reloj (`ahora`), notificador (mail) y pasarela de Mercado Pago se inyectan por constructor.
- **Separación de responsabilidades:** las interfaces y los tipos compartidos viven en archivos específicos (`compras.types.ts`, `pagos.types.ts`). Si hay que modificar un contrato compartido, se avisa al equipo antes y se actualizan los tests en el mismo PR.
- **Tipado estricto:** firmas y objetos de retorno siempre tipados (por ejemplo `procesarPago(...): Promise<ResultadoPago>`). Está prohibido `any`; si el tipo es desconocido se usa `unknown` y se acota.
- **Dinero:** los importes se manejan como números enteros en pesos argentinos (ARS), sin decimales. Los descuentos se calculan sobre enteros y el redondeo, si hiciera falta, se define en un único lugar.
- **Fechas y horarios:** toda regla horaria (cierre de compra del mismo día a las 17:30, horario del parque) se evalúa en la zona horaria `America/Argentina/Cordoba`. La fecha actual nunca se obtiene con `new Date()` dentro de la lógica; llega por el parámetro `ahora`.
- **Funciones:** cada método hace una sola cosa y las validaciones van al principio, antes de modificar estado o llamar a servicios externos.

### 2.3 Formato y verificación automática

Las reglas que se pueden verificar con una herramienta se verifican con una herramienta, no a ojo.

| Herramienta | Configuración acordada |
|---|---|
| TypeScript | `"strict": true` en `tsconfig.json`. `npm run typecheck` debe terminar sin errores. |
| ESLint | `@typescript-eslint/no-explicit-any` en error, además de `no-unused-vars` y `eqeqeq`. `npm run lint` debe pasar. |
| Prettier | 2 espacios de indentación, comillas simples, punto y coma, coma final en estructuras multilínea y ancho máximo de 100 caracteres. `npm run format:check` debe pasar. |
| Vitest | `npm test` debe pasar completo. Se informa la cobertura con `npx vitest --coverage`; el grupo se propone al menos 90 % de líneas en los tres servicios. |

Antes de abrir un Pull Request se corre, en este orden:

```bash
npm run typecheck
npm run lint
npm test
```

> Un PR con alguno de los tres en rojo **no se mergea**.

### 2.4 Git: ramas y commits

- **Ramas:** una por paquete de trabajo, con el formato `tp6/pN-nombre` (por ejemplo `tp6/p3-tarifas`), creada desde el commit inicial en rojo.
- **Commits:** un commit por cada paso del ciclo, con prefijo y paquete: `red(P3): ...`, `green(P3): ...`, `refactor(P3): ...`. El mensaje describe el comportamiento, por ejemplo `green(P3): el pase VIP cuesta $20.000`.
- **Pull requests:** se abre un PR a `main` cuando el paquete completo está en verde. Cada integrante toca solo los archivos de su módulo.

---

## 3. Convenciones para TDD (Testing)

El desarrollo de la US «Comprar entradas» se rige estrictamente por Test-Driven Development.

### 3.1 Organización de los tests

- Los tests unitarios terminan en `.test.ts` y se ubican en `test/` (`parque.service.test.ts`, `pagos.service.test.ts`, `compras.service.test.ts`).
- Los tests prueban cada servicio de forma aislada. Las dependencias externas (Mercado Pago, mails, base de datos) se reemplazan por fakes o mocks (por ejemplo, `vi.fn()`).
- Los tests que integran los servicios reales para cubrir los escenarios de usuario van en `compras.integracion.test.ts`.
- **Estructura:** un `describe` por método y un `it` por comportamiento, con nombre en español que empieza con «debe». Cada test sigue el patrón Arrange-Act-Assert.

```ts
describe('comprarEntradas', () => {
  it('debe rechazar más de 10 entradas', () => {
    // Arrange
    // Act
    // Assert
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
