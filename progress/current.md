# Estado actual

**Fase:** Fase 1
**Tarea en curso:** T1.3 · Rutas y pantallas base (login, registro y home): **CERRADA** (aprobada por el humano el 2026-10-05, marcada [x]). T1.4 no empieza sin OK del humano.

**Qué se hizo:**

- Se instaló `vue-router` 5.3.1 con `vp install vue-router` dentro de `apps/website`. Quedó en `dependencies` como
  `"vue-router": "catalog:"`, igual que los otros paquetes. `vp install` agregó `vue-router: ^5.3.1` al catálogo de
  `pnpm-workspace.yaml` y actualizó `pnpm-lock.yaml`.
- `src/router/index.ts`: rutas `/` (home), `/login` y `/register` con `createWebHistory(import.meta.env.BASE_URL)`.
  Las direcciones quedan normales, sin `#`. En producción funciona porque la API ya devuelve `index.html` para
  cualquier ruta (no se tocó). Antes de escribir el código, se comprobó que estas funciones existen en los tipos instalados.
- **Las vistas se cargan directo, no en diferido:** son tres pantallas chicas que se usan siempre, así que separarlas
  en archivos aparte no ahorra nada y suma complejidad. Si más adelante una pantalla crece mucho, se puede cambiar.
- `main.ts` registra el router con `app.use(router)`, después de Pinia.
- `App.vue` ahora tiene solo `<RouterView />`. Se sacó el "Ready to build something great.".
- `views/LoginView.vue` ("Iniciá sesión"), `views/RegisterView.vue` ("Registrate") y `views/HomeView.vue` ("Hola"):
  un `<h1>` con clases mínimas de Tailwind. No tienen `<script>` ni lógica.

**Archivos:** `apps/website/src/router/index.ts` (nuevo), `apps/website/src/views/LoginView.vue` (nuevo),
`apps/website/src/views/RegisterView.vue` (nuevo), `apps/website/src/views/HomeView.vue` (nuevo),
`apps/website/src/App.vue`, `apps/website/src/main.ts`, `apps/website/package.json`, `pnpm-lock.yaml`,
`pnpm-workspace.yaml` (solo la línea de vue-router en el catálogo). No se tocó `apps/api`, `auth-client.ts` ni `authSchemas.ts`.

**Checks:**

- `vp run website#check` → pasa: 14 archivos con formato correcto; sin advertencias ni errores de lint o de tipos en 10 archivos.
- `vp run website#build` → pasa: `vue-tsc --noEmit` ok; `vp build` armó 27 módulos en 123 ms.

**Aviso de la instalación (para el humano):** `vp install` mostró "unmet peer vue@^3.5.34 || ^4.0.0: found 3.5.33".
vue-router 5.3.1 pide Vue 3.5.34 o más nuevo y el proyecto tiene 3.5.33. Es una versión de parche de diferencia
y los checks y el build pasan, pero hay que confirmarlo en el navegador. Si querés que el aviso desaparezca, se puede
actualizar Vue (`vp update vue` dentro de `apps/website`). No lo hice porque no es parte de T1.3.

**Provisorio (según el PLAN):** las rutas no están protegidas (cualquiera entra a `/`) y no hay redirecciones.
Se reemplaza en T1.9 (guards con la sesión real). Tampoco hay enlaces entre pantallas (T1.6), formularios (T1.5/T1.6)
ni diseño de dos columnas (T1.4).

**Cómo probarlo:** pedile al humano que corra `vp run website#dev` (o `vp run dev`) y abra:

- `http://localhost:5173/login` → título "Iniciá sesión" arriba a la izquierda, fondo blanco.
- `http://localhost:5173/register` → título "Registrate".
- `http://localhost:5173/` → título "Hola".
- Con F12 → Consola: no debe haber errores ni advertencias de Vue o del router en ninguna de las tres.
- Una dirección que no existe (ej. `/cualquiera`) muestra la pantalla en blanco con la advertencia "No match found"
  del router en la consola. Es lo esperado: el PLAN no pide página 404 ni redirección.

**Qué sigue:** el humano prueba T1.3 en el navegador y la aprueba. Con su OK: marcar [x] y, si lo indica, seguir con T1.4 (diseño de dos columnas).
**Notas / bloqueos:** -

---

**Cerradas:**

- **T1.1 · Preparar el frontend** (aprobada 2026-10-05): pinia 4.0.3 y zod 4.6.5 instalados con `vp install`,
  Pinia registrada en `main.ts`, script `check` agregado. El PLAN dice `vp install` en vez de `vp add`.
- **T1.2 · Esquemas de validación con Zod** (aprobada 2026-10-05): `components/auth/authSchemas.ts` con
  `loginSchema`, `registerSchema`, tipos `LoginData`/`RegisterData`, `AUTH_MESSAGES` y `PASSWORD_MIN_LENGTH`.
  Revisión: APROBADO. Pendiente no bloqueante: el "8" del mensaje está escrito a mano en vez de usar `PASSWORD_MIN_LENGTH`.
  Los borrados de `public/favicon.png`, `src/assets/*` y `src/counter.ts` vienen de `vp run cleanup` (lo corrió el humano antes de T1.1).

---

**Reordenamiento del PLAN (coordinador, 2026-10-05, pedido por el humano):** el resto de la Fase 1 quedó primero visual
y después lógica. Nueva numeración: T1.3 rutas y pantallas base · T1.4 diseño de dos columnas · T1.5 formulario de login
en pantalla · T1.6 formulario de registro en pantalla y enlaces · T1.7 home con "Cerrar sesión" (visual) · T1.8 almacenamiento
de usuarios · T1.9 sesión con Pinia conectada al login, home y rutas · T1.10 registro conectado · T1.11 tests · T1.12 cierre.
Lo provisorio (T1.3, T1.5, T1.6, T1.7) está marcado en el PLAN junto con la tarea que lo reemplaza (T1.9 y T1.10).
T1.1 y T1.2 no cambiaron. T1.2 sigue esperando la aprobación del humano. Decisiones nuevas anotadas en
"Esperando decisión del humano" del PLAN.

**Decisiones del humano (2026-10-05):** T1.2 aprobada; texto "Confirmá tu contraseña" aprobado; mientras la lógica no esté
conectada, el envío válido muestra el aviso "todavía no está conectado"; la lógica de sesión queda partida en T1.9 (ingreso)
y T1.10 (registro). Pasadas a "Decisiones tomadas" del PLAN (D9, D10, D11).

**Revisión T1.3 (reviewer, 2026-10-05):** APROBADO (falta que el humano pruebe en el navegador).

- Criterio verificado: `vue-router` 5.3.1 en `dependencies` (`catalog:`, con la línea en el catálogo de `pnpm-workspace.yaml` y el lockfile actualizado); `router/index.ts` con `/`, `/login` y `/register` (rutas con nombre) y `createWebHistory(import.meta.env.BASE_URL)`; registrado en `main.ts` después de Pinia; `App.vue` solo con `<RouterView />`; las vistas tienen solo `<template>` con "Iniciá sesión", "Registrate" y "Hola", en voseo y con Tailwind.
- Funciones del router revisadas en los tipos instalados: `createRouter`, `createWebHistory(base?: string)`, `RouteRecordRaw` y `RouterView` existen en vue-router 5.3.1. No hay nada inventado ni viejo.
- Direcciones sin `#`: en producción funcionan porque la API ya devuelve `index.html` para cualquier ruta (`apps/api/src/index.ts:33-34`).
- Alcance: no se adelantó trabajo de T1.4 en adelante (sin layout, formularios, enlaces ni guards). Sin cambios en `apps/api`, `packages/`, `auth-client.ts` ni `authSchemas.ts`.
- Checks (los corrió el reviewer): `vp run website#check` → 14 archivos con formato correcto, sin errores de lint ni de tipos en 10 archivos. `vp run website#build` → `vue-tsc` sin errores; `vp build` armó 27 módulos en 125 ms.
- Aviso de versión (vue-router pide vue ≥3.5.34 y el proyecto tiene 3.5.33): no bloquea. Es solo la versión mínima que pide vue-router; las funciones de Vue que usa existen desde Vue 3.0 a 3.3; tipos y build pasan; no traba la instalación ni el Docker. Recomendación: actualizar `vue` a `^3.5.34` en una tarea aparte (después `vp install`, check, build y reconstruir el Docker).
- No bloqueante: `pnpm-workspace.yaml` cambió por la instalación (sumarlo a "Archivos" en futuras tareas que instalen paquetes); `/cualquiera` muestra la pantalla en blanco con la advertencia "No match found" en la consola, como se esperaba; `index.html` tiene `lang="en"` (viene de antes de T1.3; se puede cambiar a `es` en T1.4 o en el cierre, T1.12).
- Pendiente del humano: correr `vp run website#dev` y abrir `/login`, `/register` y `/` para ver cada título, sin errores en la consola.

**Nota del coordinador (2026-10-05):** el reviewer no tiene herramienta de edición; el coordinador copió este texto tal cual. **Estado:** T1.3 esperando aprobación del humano (prueba en navegador). No se empieza T1.4 sin su OK.
