# Estado actual

**Fase:** Fase 1 **COMPLETA** (2026-10-06). Fase 2 en **borrador**, pendiente de aprobación del humano.
**Tarea en curso:** ninguna. No se empieza ninguna tarea de la Fase 2 hasta que el humano apruebe el borrador del PLAN y
responda sus preguntas ("Esperando decisión del humano" en el PLAN).

**Decisiones del humano (2026-10-06, transmitidas por el agente que lanzó al coordinador):** T1.12 aprobada tras la prueba
manual (marcada [x]); con eso la Fase 1 queda completa. D18: autoriza formatear **solo** `.claude/agents/implementer.md` y
`.claude/agents/reviewer.md`, **solo** con `vp fmt` sobre esos dos archivos y sin cambiar el texto (lo corre quien lanzó al
coordinador; el coordinador no los toca). Pidió un borrador de la Fase 2: pasar el login al servidor con better-auth.

**Borrador de la Fase 2 (coordinador, 2026-10-06):** escrito en el PLAN como "Fase 2 — Login en el servidor con better-auth
(BORRADOR, pendiente de aprobación)", tareas T2.1 a T2.8 (primero lo visual: T2.1). Cinco preguntas para el humano en el PLAN.

---

**Historial de T1.12 (cerrada, se conserva la evidencia):**

**Decisiones del humano (2026-10-06, transmitidas por el agente que lanzó al coordinador):** T1.11 aprobada tras probarla en el
navegador (marcada [x]); mensaje genérico del registro aceptado con el texto "No pudimos completar el registro. Probá de nuevo."
(cambio en T1.12); `.claude/agents/implementer.md` se deja como está y `.claude/agents/` sigue sin OK (ni para formatear);
se sigue con el mismo método de pedidos. Anotado en el PLAN como D17.

**Plan de T1.12 (ver PLAN):**

1. Texto de `AUTH_MESSAGES.registerFailed` → "No pudimos completar el registro. Probá de nuevo."; actualizar `authSchemas.test.ts`
   y `useAuthStore.test.ts`.
2. Checklist: `vp test`, `vp run website#check`, `vp run website#build`; `git diff` sin cambios en `apps/api/`,
   `src/lib/auth-client.ts` ni migraciones; sin variables de entorno nuevas; nada provisorio de T1.3, T1.5, T1.6 ni T1.7.
3. Último paso: `vp fmt PLAN.md progress/current.md progress/history.md`; `vp check` en la raíz solo marca `.claude/agents/`.
4. Prueba manual final del humano (ver el criterio en el PLAN).

**Qué hizo el implementer en T1.12 (2026-10-06):**

- `authSchemas.ts`: `AUTH_MESSAGES.registerFailed` pasa a "No pudimos completar el registro. Probá de nuevo.".
- `authSchemas.test.ts` (línea 32) y `useAuthStore.test.ts` (línea 716) comparan con el texto nuevo. `RegisterForm.vue` no
  tiene el texto escrito: muestra `auth.registerError`, que el store llena con `AUTH_MESSAGES.registerFailed`.
- Desvío chico (solo comentarios): los comentarios "Desvío de T1.11 pendiente de confirmación del humano... Para sacarlo:
  borrar..." en el `catch` de `register` (`useAuthStore.ts`) y en el bloque "register › falla inesperada" de
  `useAuthStore.test.ts` quedaron viejos con D17; ahora dicen que es el mensaje genérico confirmado (D17). No cambia código.
- No se tocó `.claude/agents/`, `apps/api`, `src/lib`, `package.json` ni el lockfile.

**Checklist de cierre (salida real):**

- `grep -rn "No pudimos crear la cuenta" apps/website/src` → sin resultados.
- `cd apps/website && vp test --reporter=verbose` → `Test Files 6 passed (6)`, `Tests 165 passed (165)`; sin `stderr` ni
  aviso `R0100` (las únicas coincidencias de "R0100" son nombres de pruebas).
- `vp run website#check` → "All 37 files are correctly formatted" y "Found no warnings, lint errors, or type errors in 33 files".
- `vp run website#build` → `vue-tsc --noEmit` sin errores; 1867 módulos; `index.js` 191,37 kB (gzip 64,94 kB), CSS 14,64 kB.
- `git diff HEAD --stat -- apps/api apps/website/src/lib/auth-client.ts` → vacío; `apps/api/src/db/migrations` sin cambios
  (`git diff HEAD --stat` y `git status --short -- apps/api` vacíos); `.env.example` sin cambios.
- Variables de entorno en `apps/website/src`: `import.meta.env.BASE_URL` (`router/index.ts`) y
  `import.meta.env.VITE_API_URL` (`lib/auth-client.ts`, viene del commit inicial del template, archivo sin cambios). Ninguna nueva.
- `grep -rniE "provisori|D10|todavía no" apps/website/src` → 5 coincidencias, todas falsos positivos: "todavía no" en
  comentarios y nombres de pruebas sobre el usuario semilla que todavía no se guardó (`userStorage.ts:94`,
  `useAuthStore.ts:32`, `useAuthStore.test.ts:586` y `:593`, `userStorage.test.ts:247`). Nada de "provisorio" ni "D10".
- `vp fmt PLAN.md progress/current.md progress/history.md` y `vp check` en la raíz: resultado en `progress/history.md`
  (se corre como último paso, después de escribir esto).

**Prueba manual para el humano** (correr `vp run website#dev` y abrir http://localhost:5173):

1. Campos vacíos: en `/login` y en `/register`, tocar el botón sin completar nada → aparecen los errores de cada campo
   y el foco va al primero.
2. Credenciales incorrectas: `demo@demo.com` con una contraseña equivocada → "Email o contraseña incorrectos".
3. Login con el usuario semilla: `demo@demo.com` / `demo1234` → entra a `/` y saluda con el email.
4. Registro de un usuario nuevo (por ejemplo `nuevo@demo.com` / `clave1234` dos veces) → entra directo a `/`. Probar
   también con `demo@demo.com` → "Ya existe una cuenta con ese email".
5. Vista mobile (~375 px, con las herramientas del navegador): la imagen del costado se oculta y el formulario se ve
   completo, sin desbordes.
6. Recarga: con la sesión iniciada, recargar `/` → sigue adentro.
7. Logout: tocar "Cerrar sesión" → vuelve a `/login`; "Atrás" no vuelve a la home; ir a `/` lleva a `/login`. Volver a
   entrar con el usuario registrado en el paso 4.

**Revisión T1.12 (reviewer, 2026-10-06; informe copiado por el coordinador):** APROBADO (falta la prueba manual y el OK del humano).

| Punto del criterio                                                                                         | Evidencia                                                                                                                                | Resultado |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `vp test` en verde                                                                                         | 165/165 (6 passwordHash, 25 authSchemas, 9 useSchemaForm, 37 userStorage, 68 useAuthStore, 20 authGuard); sin stderr ni `R0100`          | OK        |
| `website#check` y `website#build`                                                                          | check: 37 archivos con formato correcto, sin errores en 33; build: JS 191,37 kB (64,94 kB gzip), CSS 14,64 kB                            | OK        |
| Sin cambios en `apps/api`, `src/lib/auth-client.ts`, migraciones, `package.json`, lockfile, `.env.example` | `git diff HEAD --stat` → vacío                                                                                                           | OK        |
| Sin variables de entorno nuevas                                                                            | ninguna nueva en `apps/website/src`                                                                                                      | OK        |
| Nada provisorio de T1.3, T1.5, T1.6 ni T1.7                                                                | grep: las 5 coincidencias de "todavía no" hablan del usuario semilla todavía no guardado (falsos positivos)                              | OK        |
| Texto nuevo del registro "No pudimos completar el registro. Probá de nuevo."                               | `authSchemas.ts:28`; pruebas `authSchemas.test.ts:32` y `useAuthStore.test.ts:716`; el texto viejo ya no aparece                         | OK        |
| Formato de `PLAN.md` y `progress/*.md`                                                                     | `vp fmt` solo sobre esos archivos; pasan `fmt --check`; `vp check` en la raíz solo marca `.claude/agents/implementer.md` y `reviewer.md` | OK        |
| `.claude/agents/` sin tocar                                                                                | huellas sha256 de los tres archivos iguales a las anotadas antes de la tarea                                                             | OK        |
| Lista de prueba manual completa                                                                            | `progress/current.md`, "Prueba manual para el humano" (arriba)                                                                           | OK        |

- Desvío: comentarios actualizados para reflejar D17: aceptado.
- Bloqueantes: ninguno.
- No bloqueantes: (a) `VITE_API_URL` en `lib/auth-client.ts` viene del template (commit eeb2c51), no se tocó, nadie lo importa y
  tiene valor por defecto; documentarla en `.env.example` cuando el frontend use better-auth (fase futura). (b) El formato de
  `.claude/agents/` sigue pendiente del OK del humano; hasta entonces `vp check` en la raíz queda en rojo (importa si se agrega CI).

**Verificación del coordinador (2026-10-06):** `vp test` → 165/165; huellas de `.claude/agents/` iguales. El PLAN no tiene
Fase 2 definida todavía: la tiene que escribir el humano.
**Estado:** T1.12 esperando la prueba manual y la aprobación del humano; con su OK se marca [x] y la Fase 1 queda completa.
Sigue sin respuesta si autoriza formatear `.claude/agents/`.

---

**Historial de T1.11 (cerrada, se conserva la evidencia):**

**Decisiones del humano (2026-10-06, transmitidas por el agente que lanzó al coordinador):** T1.10 aprobada (marcada [x]);
aceptadas las recomendaciones del coordinador: el aviso `R0100` de la ruta comodín y la lista de rutas repetida en la prueba
(pasa a `router/routes.ts`) se suman a T1.11; el formato de los documentos queda para T1.12; `.claude/agents/` no se toca sin
OK explícito. Anotado en el PLAN como D16.

**Plan de T1.11 (lo que tiene que hacer el implementer, ver PLAN):**

1. Pruebas de `authSchemas` (`authSchemas.test.ts`): campos vacíos, email inválido (`hola@`), email con espacios/mayúsculas,
   contraseña corta, confirmación vacía ("Confirmá tu contraseña") y que no coincide. De paso, el "8" del mensaje usa
   `PASSWORD_MIN_LENGTH` (pendiente no bloqueante de T1.2).
2. Al restaurar la sesión, comprobar que el email de `auth.session` exista en `auth.users`; si no, sin sesión.
3. En `startSession`, guardar primero en `auth.session` y recién después marcar `currentUser`.
4. Si `verifyCredentials` (o `addUser`) lanza, mensaje genérico en voseo en el formulario, sin quedar trabado en "cargando".
5. Mover `SESSION_MESSAGES` a `AUTH_MESSAGES` en `authSchemas.ts`.
6. `MemoryStorage` en un único helper de pruebas compartido.
7. De T1.8: renombrar la prueba de nombre engañoso y normalizar el email guardado al buscar.
8. De T1.10: `catchAllRoute` con `params: {}` (sin aviso `R0100`).
9. De T1.10: lista de rutas en `router/routes.ts`, usada por `router/index.ts` y por `router/authGuard.test.ts`.

Cada arreglo con su prueba; `vp test`, `vp run website#check` y `vp run website#build` en verde.

**Qué hizo el implementer en T1.11 (2026-10-06):**

1. `components/auth/authSchemas.ts`: `PASSWORD_MIN_LENGTH` va antes de `AUTH_MESSAGES` y `passwordMin` se arma con él
   (ya no tiene el "8" escrito a mano). `AUTH_MESSAGES` suma los mensajes generales: `invalidCredentials`, `emailTaken`
   (los que eran `SESSION_MESSAGES`), `loginFailed` ("No pudimos procesar el ingreso. Probá de nuevo.") y `registerFailed`
   ("No pudimos crear la cuenta. Probá de nuevo."). `SESSION_MESSAGES` ya no existe; el store y sus pruebas usan `AUTH_MESSAGES`
   (los formularios no lo usaban: no cambiaron).
2. `components/auth/userStorage.ts`: función interna `hasEmail` que normaliza el email guardado al comparar; la usan
   `findUserByEmail` y los dos chequeos de duplicado de `addUser`. `verifyCredentials` devuelve el email normalizado.
   Nueva `userExists(email, storage?)`: lectura **sincrónica** (no escribe nada); si todavía no hay usuarios guardados
   (clave vacía, JSON roto o sin entradas válidas) solo cuenta como existente `demo@demo.com`, que `getUsers` crea en cuanto se use.
3. `components/auth/useAuthStore.ts`: `readSession` normaliza el email de `auth.session` y solo restaura si `userExists`
   (sigue siendo sincrónica; el guard no espera nada). `startSession` guarda primero en `auth.session` y después marca
   `currentUser`. `login` y `register` tienen un `catch`: `console.error` + `loginError`/`registerError` con el mensaje genérico,
   devuelven `false`, `isLoading` vuelve a `false` en el `finally`. El de `register` está marcado en el código como desvío
   pendiente de confirmación, con instrucciones para sacarlo.
4. `router/routes.ts` (nuevo): la lista de rutas con sus marcas y la comodín al final, sin crear el router. `router/index.ts`
   la importa. `router/authGuard.ts`: `catchAllRoute` con `redirect: { name: "home", params: {} }`.
5. `components/auth/testStorage.ts` (nuevo, solo para pruebas): clase `MemoryStorage` compartida; se borró la copia de
   `userStorage.test.ts` y la de `useAuthStore.test.ts`.
6. Pruebas (70 nuevas, de 95 a 165):
   - `authSchemas.test.ts` (nuevo, 25): mínimo armado con `PASSWORD_MIN_LENGTH`; textos de los mensajes generales; login y
     registro con campos vacíos (un solo error por campo, sin "no coinciden"), `"   "`/`" "` como vacío, emails inválidos
     (`hola@`, `hola`, `@mail.com`, `hola@mail`, con espacio adentro), email con espacios y mayúsculas normalizado,
     contraseña de 7 (error) y de 8 (pasa), contraseña vacía solo "obligatoria", confirmación vacía "Confirmá tu contraseña",
     no coinciden (también por mayúsculas o un espacio) y "no coinciden" junto a otros errores.
   - `useSchemaForm.test.ts` (nuevo, 9): campos vacíos y email inválido no envían y muestran el error; foco al primer campo
     con error; datos válidos se envían una vez con el email normalizado; editar borra solo el error de ese campo; sin doble
     envío; si el envío falla `isSubmitting` vuelve a `false` y se puede reenviar; registro con contraseñas distintas no envía;
     `onEdit` borra "no coinciden" al editar la contraseña.
   - `userStorage.test.ts` (+14): prueba renombrada a "la contraseña distingue mayúsculas y sus espacios cuentan (no se recortan)";
     usuario guardado a mano como `"  Ana@Mail.COM "` (se encuentra, verifica con email normalizado, rechaza otra clave, no
     admite duplicado); `userExists` (encuentra sin distinguir mayúsculas/espacios, no encuentra inexistentes, es sincrónica y no
     escribe, semilla todavía no creado con clave vacía / JSON roto / `[]` / sin entradas válidas, semilla ausente si hay otros
     usuarios, coincide con `getUsers`).
   - `useAuthStore.test.ts` (+16): restaurar solo si el email existe (inventado → sin sesión; registrado → se restaura; en
     mayúsculas → se restaura normalizado; semilla no creado → `demo@demo.com` sí, otro no; `auth.users` roto; semilla ausente
     con otros usuarios; listo sin esperar; falla al leer `auth.users` → sin sesión). Fallas inesperadas del login: `setItem`
     de `auth.session` falla → sin sesión, mensaje genérico, `isLoading` false y al recargar sigue sin sesión; `verifyCredentials`
     lanza → mensaje genérico, `isLoading` true durante y false después; se puede reintentar; `clearError` lo oculta. Bloque
     aparte "register › falla inesperada" (3, el desvío): `addUser` lanza, `setItem` falla, reintento.
   - `router/authGuard.test.ts` (+6): usa `routes` de `routes.ts` (ya no repite las rutas); la lista tiene home/login/registro
     con sus marcas y la comodín última; cada ruta con nombre tiene vista; la comodín redirige con `params: {}`; al ir a
     `/xyz`, `/no/existe/nada` y `/xyz?a=1#b` (con y sin sesión) no hay ningún `console.warn`.
   - Comprobado que las pruebas fallan si se deshace cada arreglo: sin `params: {}` fallan 4; con el orden viejo en
     `startSession` fallan 2; sin el chequeo de existencia en `readSession` fallan 5; sin normalizar el email guardado fallan 4.

**Repaso de cobertura contra el criterio:** campos vacíos (`authSchemas`, `useSchemaForm`), email inválido (ídem), contraseñas
que no coinciden (ídem), credenciales correctas e incorrectas (`userStorage`, store), JSON corrupto (`auth.users` en `userStorage`
y en `userExists`; `auth.session` en el store), email duplicado (`userStorage`, store, también guardado a mano en mayúsculas),
usuario semilla (`userStorage`, `userExists`, store) y nunca la contraseña en claro (`userStorage`, store login/registro). Lo que
faltaba era `authSchemas` y `useSchemaForm`; se agregó.

**Checks (los corrió el implementer):** `cd apps/website && vp test` → 6 archivos, **165/165** (6 passwordHash + 37 userStorage +
68 store + 25 authSchemas + 9 useSchemaForm + 20 guards/rutas). Con `--reporter=verbose` ya no aparece `[VUE_ROUTER_R0100]` (antes
8 veces) ni ninguna salida por stderr. `vp run website#check` → 37 archivos con formato correcto, sin errores de lint ni de tipos
en 33. `vp run website#build` → `vue-tsc` sin errores, 1867 módulos, JS 191,37 kB (64,94 kB gzip). Sin cambios en `apps/api`,
`src/lib`, `package.json`, lockfile ni `.claude/agents/`.

**Desvíos:**

1. **Sesión vs. usuario semilla (cómo se resolvió lo sincrónico):** `readSession` no llama a `getUsers` (asincrónica); usa
   `userExists`, una lectura sincrónica nueva en `userStorage.ts`. Si `auth.users` todavía no tiene usuarios válidos, solo cuenta
   el semilla `demo@demo.com` (es exactamente lo que `getUsers` va a crear), así una sesión del semilla con la lista aún vacía o
   rota no se pierde, y cualquier otro email sí. No crea ni escribe nada al leer.
2. Al restaurar, el email de `auth.session` se normaliza (si alguien lo editó a mano en mayúsculas, se muestra en minúsculas).
3. **Pendiente de confirmación del humano:** mensaje genérico también en el registro ("No pudimos crear la cuenta. Probá de
   nuevo."). Aislado: un `catch` en `register` (comentado en el código), la clave `AUTH_MESSAGES.registerFailed`, su línea en
   `authSchemas.test.ts` › "textos en voseo…" y el bloque "register › falla inesperada" de `useAuthStore.test.ts`. Caso borde:
   si la cuenta se crea pero falla guardar la sesión, sale ese mismo mensaje aunque la cuenta ya exista (al reintentar diría
   "Ya existe una cuenta con ese email" y se puede entrar por el login).
4. Las fallas inesperadas se informan con `console.error` (el logging del proyecto es `console`); en las pruebas se silencia
   con un espía y se comprueba que se llamó.
5. Archivo de prueba extra `useSchemaForm.test.ts` (no estaba en la lista; el criterio pide cubrir campos vacíos/email
   inválido/no coinciden y ahí está la lógica de los formularios). El helper se llama `testStorage.ts` (no `*.test.ts`, para que
   `vp test` no lo tome como archivo de pruebas); la app no lo importa.
6. Los formularios no cambiaron: ya muestran `auth.loginError`/`auth.registerError` con `FormAlert`, así que el mensaje genérico
   aparece solo, y como `login`/`register` ya no lanzan, el botón no queda en "Ingresando..."/"Creando cuenta...".

**Cómo probarlo el humano:**

1. Por consola: `cd apps/website && vp test --reporter=verbose` → 165 pruebas en verde y sin ningún aviso `R0100`.
2. En el navegador (correr `vp run dev`; abrir `http://localhost:5173`):
   - Con sesión iniciada, en DevTools > Application > Local Storage cambiar `auth.session` a `{"email":"inventado@demo.com"}` y
     recargar → va a `/login`. Cambiarlo a `{"email":"DEMO@demo.com"}` y recargar → home con "Hola, demo@demo.com".
   - Borrar todo el Local Storage, poner solo `auth.session` = `{"email":"demo@demo.com"}` y recargar → home (el semilla cuenta
     aunque `auth.users` todavía no exista).
   - Escribir `/xyz` en la barra → redirige como antes y la consola del navegador ya no muestra el aviso amarillo `R0100`.
   - Login y registro como siempre (sin cambios visibles). El mensaje genérico no se puede provocar a mano fácilmente; lo cubren
     las pruebas.

**Revisión T1.11 (reviewer, 2026-10-06; informe copiado por el coordinador):** APROBADO (falta el OK del humano).

| Caso (criterio del PLAN y D16)                                                                                                             | Evidencia                                                           | Resultado |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | --------- |
| Pruebas de `authSchemas` (vacíos, email inválido, normalización, mínimo 8 con `PASSWORD_MIN_LENGTH`, confirmación vacía y que no coincide) | `authSchemas.test.ts` (25)                                          | OK        |
| Sesión con email inexistente en `auth.users` no se restaura; la del usuario semilla sí, aun sin crear                                      | `useAuthStore.test.ts`; `userExists` sincrónico en `userStorage.ts` | OK        |
| Guardar `auth.session` antes de marcar `currentUser`: si falla el guardado no queda sesión                                                 | `useAuthStore.test.ts`                                              | OK        |
| Error inesperado → mensaje genérico en voseo, `isLoading` vuelve a `false`                                                                 | `useAuthStore.test.ts`                                              | OK        |
| `SESSION_MESSAGES` movido a `AUTH_MESSAGES`                                                                                                | grep `SESSION_MESSAGES` en `src/` → sin resultados                  | OK        |
| `MemoryStorage` unificado                                                                                                                  | única definición en `components/auth/testStorage.ts`                | OK        |
| Prueba de T1.8 renombrada; email guardado normalizado al buscar                                                                            | `userStorage.test.ts` (37)                                          | OK        |
| Ruta comodín sin aviso `R0100`                                                                                                             | salida de `vp test`: sin `[VUE_ROUTER_R0100]` ni stderr             | OK        |
| Rutas en `router/routes.ts`, usadas por `index.ts` y `authGuard.test.ts`                                                                   | `authGuard.test.ts` (20 guards/rutas)                               | OK        |
| Alcance: sin cambios en `apps/api`, `src/lib`, `package.json`, lockfile                                                                    | `git diff HEAD --stat` → vacío                                      | OK        |

- Checks (los corrió el reviewer): `vp test --reporter=verbose` → 6 archivos, **165/165** (6 passwordHash, 25 authSchemas,
  9 useSchemaForm, 37 userStorage, 68 store, 20 guards/rutas). `vp run website#check` → 37 archivos con formato correcto, sin
  errores en 33. `vp run website#build` → `vue-tsc` sin errores, 1867 módulos, JS 191,37 kB (64,94 kB gzip).
- Desvíos: `userExists` sincrónico: correcto, sin riesgo nuevo. `testStorage.ts` y `useSchemaForm.test.ts`: aceptables.
  Mensaje genérico también en el registro: recomendado, **pendiente de decisión del humano**. Sugerencia no bloqueante: texto
  más neutro "No pudimos completar el registro. Probá de nuevo." (cubre el caso raro en que la cuenta se creó pero falló guardar la sesión).
- Observación: `.claude/agents/implementer.md` tiene fecha de modificación 10:28:36, dentro del rango en que trabajó el
  implementer. Verificación del coordinador: su contenido es idéntico al que el coordinador leyó al empezar T1.11, antes de que
  trabajara el implementer (el diff contra HEAD solo tiene el bloque "## Tests por tarea" de D14). Se le consulta al humano.
- Bloqueantes: ninguno.

**Cómo probarlo el humano en el navegador** (correr `vp run dev`; abrir `http://localhost:5173`; DevTools > Application > Local Storage):

1. Poner `auth.session` = `{"email":"inventado@demo.com"}` y recargar → va a `/login`.
2. Poner `auth.session` = `{"email":"DEMO@demo.com"}` y recargar → home con "Hola, demo@demo.com".
3. Borrar `auth.users`, dejar solo la sesión del usuario semilla y recargar → home.
4. Escribir `/xyz` → no aparece el aviso amarillo de vue-router en la consola.
5. Por consola: `cd apps/website && vp test --reporter=verbose` → 165 pruebas en verde.

**Verificación del coordinador (2026-10-06):** `vp test` → 6 archivos, 165/165; `website#check` → 37 archivos, sin errores en 33;
`website#build` → JS 191,37 kB (64,94 kB gzip). Confirmado: sin `SESSION_MESSAGES`, `MemoryStorage` solo en `testStorage.ts`,
existe `router/routes.ts`, sin cambios en `apps/api`/`src/lib`/`package.json`/lockfile.
**Estado:** T1.11 esperando la aprobación del humano. Siguen sin respuesta: cómo seguir con los agentes y el mensaje genérico del
registro. T1.12 no se empieza.

---

**Historial de T1.10 (cerrada, se conserva la evidencia):**

**Qué hizo el implementer (2026-10-06):**

- `components/auth/useAuthStore.ts`: acción `register(email, password)` → usa `addUser` de `userStorage.ts`; si devuelve `null`
  deja `registerError` = "Ya existe una cuenta con ese email" (`SESSION_MESSAGES.emailTaken`, junto al de login) y devuelve `false`
  sin tocar la sesión; si sale bien inicia sesión (`currentUser` = `{ email }` y `auth.session` = `{"email":...}`) y devuelve `true`.
  Mismo manejo de `isLoading` y del doble envío que `login` (mientras procesa, otra llamada a `login` o `register` devuelve `false`).
  Login y registro guardan la sesión con la misma función interna `startSession` (mismo orden que hoy; el cambio de orden es de T1.11,
  así queda en un solo lugar). Estado nuevo `registerError`; `clearError()` y `logout()` borran los dos errores.
- `components/auth/RegisterForm.vue`: usa `useSchemaForm` con `registerSchema`; `onEdit` borra "Las contraseñas no coinciden" al
  editar la contraseña y oculta el error de registro al editar cualquier campo. Llama a `useAuthStore().register`; si sale bien,
  `router.replace({ name: "home" })`. Email duplicado → `FormAlert variant="error"`. Botón "Creando cuenta..." y deshabilitado
  (`isSubmitting || auth.isLoading`). Sin aviso provisorio D10, sin lógica propia de formulario, sin acceso a localStorage.
  Al entrar a la pantalla llama a `auth.clearError()` (igual que `LoginForm`).
- Ruta comodín (D15): `catchAllRoute` (`/:pathMatch(.*)*` → `{ name: "home" }`) exportada desde `router/authGuard.ts` y agregada
  última en `router/index.ts`. Sin pantalla "no encontrada".
- Pruebas nuevas (31): `useAuthStore.test.ts` › register (22): crea el usuario con hash y sal sin contraseña en claro; email
  normalizado; sesión iniciada (estado y `auth.session` solo con el email); se restaura al recargar; logout y volver a entrar
  (y con clave equivocada no entra); duplicado con `demo@demo.com`, en otras mayúsculas y con espacios (mensaje, sin sesión,
  `auth.users` sin cambios); un recién registrado no se puede registrar de nuevo (mismo email, mayúsculas, espacios) y su clave
  original sigue valiendo; duplicado no cambia una sesión ya iniciada; errores que se borran (registro correcto, `clearError`,
  `logout`) y no se mezclan con los de login; `isLoading` antes/durante/después (bien y duplicado); sin doble envío (también
  login + registro a la vez); nada sensible en el estado ni en `auth.session` (ni con duplicado).
  `router/authGuard.test.ts` › ruta comodín (9): router real en memoria (`createMemoryHistory`, mismas rutas y marcas, vistas
  vacías) con `catchAllRoute` y el guard: `/xyz`, `/no/existe/nada`, `/login/extra`, `/xyz?a=1#b` → sin sesión `/login`, con sesión
  `/`, contando las llamadas al guard (≤ 2, sin bucles); las rutas existentes no pasan por la comodín. Comprobado que esas 8 pruebas
  fallan si se saca `catchAllRoute`.

**Checks (los corrió el implementer):** `cd apps/website && vp test` → 4 archivos, **95/95** (64 anteriores + 31 nuevas).
`vp run website#check` → 33 archivos con formato correcto, sin errores de lint ni de tipos en 29. `vp run website#build` →
`vue-tsc` sin errores, JS 190,92 kB (64,78 kB gzip). Sin cambios en `apps/api`, `src/lib`, `package.json` ni lockfile.

**Desvíos:**

1. Error de registro en un estado propio (`registerError`), no compartido con `loginError`: así un error de una pantalla nunca
   aparece en la otra. `clearError()` borra los dos (los dos formularios lo llaman al entrar y al editar).
2. `isLoading` es uno solo para login y registro: mientras procesa uno, el otro se ignora (devuelve `false`).
3. `catchAllRoute` vive en `router/authGuard.ts` (archivo fuera de la lista de T1.10) para que la prueba use el mismo registro de
   ruta que la app; `router/index.ts` no se puede importar en las pruebas (usa `createWebHistory` e importa las vistas).
   La prueba repite las tres rutas con sus marcas (`requiresAuth`/`guestOnly`) con vistas vacías.
4. Función interna `startSession` compartida por `login` y `register` (mismo comportamiento que antes en `login`).

**Cómo probarlo el humano en el navegador** (correr `vp run dev`; abrir `http://localhost:5173`):

1. Sin sesión (borrar `auth.session` en DevTools > Application > Local Storage), ir a `/register`.
2. Enviar vacío → errores en los tres campos, foco en email. Email inválido → "Ingresá un email válido". Contraseñas distintas →
   "Las contraseñas no coinciden"; editar la contraseña → ese mensaje desaparece.
3. Registrar `demo@demo.com` (o `DEMO@demo.com`) con una clave válida → recuadro rojo "Ya existe una cuenta con ese email" y sigue
   en `/register`; editar cualquier campo → el recuadro desaparece.
4. Registrar `nueva@demo.com` / `clave1234` (confirmación igual) → el botón dice "Creando cuenta..." un instante, deshabilitado;
   luego `/` con "Hola, nueva@demo.com". Botón "Atrás" → no vuelve al registro (vuelve a `/`).
5. Local Storage: `auth.session` = `{"email":"nueva@demo.com"}`; en `auth.users` el usuario nuevo solo con `email`, `passwordHash`,
   `salt` (no aparece "clave1234").
6. Recargar → sigue en la home. "Cerrar sesión" → login; entrar con `nueva@demo.com` / `clave1234` → home.
7. Escribir `/xyz` en la barra: con sesión → `/`; después de cerrar sesión → `/login`. Nunca pantalla en blanco.
8. Por consola: `cd apps/website && vp test --reporter=verbose` → 95 pruebas en verde.

**Qué sigue:** el reviewer revisa T1.10 contra el criterio del PLAN. No se marca [x] sin el OK del humano. T1.11 no se empieza.

**Revisión T1.10 (reviewer, 2026-10-06):** APROBADO (falta que el humano pruebe en el navegador). Dos arreglos chicos recomendados (no bloqueantes, ver abajo).

| Caso (criterio del PLAN)                                                                                                                                      | Prueba                                                                                                                                                                                                       | Resultado |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| Registro crea el usuario en `auth.users` con hash + sal, sin contraseña en claro                                                                              | `useAuthStore.test.ts` › register › crea el usuario en auth.users con hash y sal…; script del reviewer: `auth.users` no contiene "clave1234"                                                                 | OK        |
| Inicia sesión solo y lleva a `/`                                                                                                                              | › deja la sesión iniciada…; `RegisterForm.vue:35` (`router.replace({ name: "home" })`); script del reviewer: formulario → `/`                                                                                | OK        |
| Después de logout se vuelve a entrar con ese usuario (y con clave equivocada no)                                                                              | › después del logout se puede volver a entrar…; › …una contraseña equivocada no entra                                                                                                                        | OK        |
| Duplicado: `demo@demo.com`, otras mayúsculas, espacios, y un usuario recién registrado → "Ya existe una cuenta con ese email", sin sesión, `auth.users` igual | › email duplicado (3 casos); › un usuario recién registrado no se puede registrar de nuevo (3 casos); script del reviewer: `" DEMO@demo.com"` desde el formulario se queda en `/register`                    | OK        |
| Duplicado se muestra con `FormAlert` de error                                                                                                                 | `RegisterForm.vue:48`                                                                                                                                                                                        | OK        |
| Campos vacíos, email inválido, contraseñas que no coinciden siguen saliendo; "Las contraseñas no coinciden" se borra al editar la contraseña                  | script del reviewer con `useSchemaForm` + `registerSchema` + el mismo `onEdit` de `RegisterForm.vue:25-32`                                                                                                   | OK        |
| `isLoading` y sin doble envío; botón "Creando cuenta..." deshabilitado                                                                                        | › register › isLoading (4 pruebas); `RegisterForm.vue:39, 87-93`                                                                                                                                             | OK        |
| Nada sensible en el estado ni en `auth.session`                                                                                                               | › register › nada sensible (2 pruebas)                                                                                                                                                                       | OK        |
| Nada provisorio en `src/`                                                                                                                                     | `grep -rniE "provisori\|D10\|todavía no" apps/website/src` → sin resultados                                                                                                                                  | OK        |
| `RegisterForm.vue` usa `useSchemaForm` y no toca localStorage                                                                                                 | `RegisterForm.vue:10, 22`; grep: `localStorage`/`auth.*` solo en `userStorage.ts` y `useAuthStore.ts`                                                                                                        | OK        |
| `/xyz` sin sesión → `/login`; con sesión → `/`; sin bucles                                                                                                    | `authGuard.test.ts` › ruta comodín (9 pruebas, guard ≤ 2 llamadas); script del reviewer (flujo registro → `/xyz` → logout → `/xyz`, tope de 20 llamadas nunca alcanzado)                                     | OK        |
| Voseo                                                                                                                                                         | "Registrate", "Completá…", "¿Ya tenés cuenta?", "Iniciá sesión"                                                                                                                                              | OK        |
| Alcance: sin cambios en `apps/api`, `src/lib`, `package.json`, lockfile, `pnpm-workspace.yaml`                                                                | `git status` / `git diff HEAD --stat` sobre esas rutas → vacío                                                                                                                                               | OK        |
| Pendientes de T1.11 no adelantados                                                                                                                            | `SESSION_MESSAGES` sigue en el store, `readSession` no mira `auth.users`, `startSession` mantiene el orden, `MemoryStorage` sigue repetido, el nombre de la prueba de T1.8 igual, `userStorage.ts` sin tocar | OK        |

- Checks (los corrió el reviewer): `cd apps/website && vp test --reporter=verbose` → 4 archivos, **95/95 pasan** (6 passwordHash + 23 userStorage + 52 store + 14 guards/comodín).
  `vp run website#check` → 33 archivos con formato correcto, sin errores de lint ni de tipos en 29. `vp run website#build` → `vue-tsc`
  sin errores, 1866 módulos, JS 190,92 kB (64,78 kB gzip).
- Script extra del reviewer (fuera del repo, 4 pruebas, todas OK): validaciones del formulario de registro, flujo completo
  registro → `/` → `/xyz` → logout → `/xyz` → login, duplicado desde el formulario, y `/xyz?a=1#b`.
- Desvíos: (1) `registerError` aparte de `loginError`: aceptable, evita que un error de una pantalla aparezca en la otra; `clearError`
  borra los dos. (2) `isLoading` compartido: aceptable, nunca hay dos formularios a la vez y evita login y registro simultáneos.
  (3) `catchAllRoute` en `authGuard.ts`: aceptable que viva ahí (la prueba usa el mismo registro que la app). Pero la prueba copia
  las tres rutas a mano (`authGuard.test.ts:44-46`): hoy coinciden con `router/index.ts:9-11`, aunque si mañana cambia una
  ruta o una marca en `index.ts`, la prueba sigue en verde sin enterarse. Además, el motivo anotado es solo en parte cierto:
  las vistas `.vue` sí se pueden importar en las pruebas (comprobado); lo que molesta es `createWebHistory`. Arreglo sugerido:
  sacar la lista `routes` a `router/routes.ts` (sin crear el router) y que la prueba la importe. (4) `startSession`: aceptable,
  mismo comportamiento y deja el cambio de orden de T1.11 en un solo lugar.
- Bloqueantes: ninguno.
- No bloqueantes: (a) cada vez que se abre una dirección inexistente, vue-router avisa en la consola del navegador (solo en
  desarrollo) `[VUE_ROUTER_R0100] Discarded invalid param(s) "pathMatch"` (se ve en la salida de `vp test`). El propio aviso
  da la solución: en `router/authGuard.ts:32` usar `redirect: { name: "home", params: {} }` (comprobado: con eso el aviso no sale).
  (b) La prueba repite las rutas (ver desvío 3). (c) `/xyz?a=1#b` termina en `/?a=1#b` (se conservan la query y el hash);
  no molesta.

**Cómo probarlo el humano en el navegador** (correr `vp run dev`; abrir `http://localhost:5173`):

1. DevTools > Application > Local Storage: borrar `auth.session` si existe. Ir a `/register`.
2. Enviar vacío → errores en los tres campos y el foco va al email. Escribir `malo` en email → "Ingresá un email válido".
3. Contraseñas distintas (por ejemplo `clave1234` y `clave9999`) → "Las contraseñas no coinciden". Editar la contraseña → ese mensaje desaparece.
4. Registrar `demo@demo.com` (probar también `DEMO@demo.com`) con `clave1234` en los dos campos → recuadro rojo "Ya existe una cuenta
   con ese email" y se sigue en `/register`. Editar cualquier campo → el recuadro desaparece.
5. Registrar `nueva@demo.com` / `clave1234` (confirmación igual) → el botón dice "Creando cuenta..." un instante; luego `/` con
   "Hola, nueva@demo.com".
6. Local Storage: `auth.session` = `{"email":"nueva@demo.com"}`; en `auth.users` el usuario nuevo y `demo@demo.com` solo con `email`,
   `passwordHash` y `salt`. No aparece "clave1234" ni "demo1234" en ningún lado.
7. Escribir `/xyz` en la barra → vuelve a `/` (con sesión). En la consola puede salir un aviso amarillo de vue-router (`R0100`): es el no bloqueante (a).
8. "Cerrar sesión" → `/login`. Escribir `/xyz` → termina en `/login`, nunca pantalla en blanco.
9. Entrar con `nueva@demo.com` / `clave1234` → `/` con "Hola, nueva@demo.com". Recargar → sigue en la home.
10. Por consola: `cd apps/website && vp test --reporter=verbose` → 95 pruebas en verde.

**Retomada de sesión (coordinador, 2026-10-06):** el código de T1.10 en disco coincide con lo revisado (ningún archivo cambió
después de la revisión; `catchAllRoute` sigue sin `params: {}`, como se revisó); sin trabajo a medias. Checks de nuevo:
`cd apps/website && vp test` → 4 archivos, **95/95**; `vp run website#check` → 33 archivos con formato correcto, sin errores en 29;
`vp run website#build` → JS 190,92 kB (64,78 kB gzip). `vp check` en la raíz del repo solo marca formato en 4 documentos
(`.claude/agents/implementer.md`, `.claude/agents/reviewer.md`, `PLAN.md`, `progress/current.md`), no en código; no se tocaron.
Sin cambios en `apps/api`, `src/lib`, `package.json` ni lockfile. **Estado:** T1.10 esperando la aprobación del humano
(prueba en el navegador) y su decisión sobre los dos arreglos chicos sugeridos. T1.11 no se empieza.

---

**Cerradas:**

- **T1.12 · Cierre de la fase: verificación final** (aprobada 2026-10-06 tras la prueba manual, transmitido por el agente que
  lanzó al coordinador): checklist completo en verde (165/165 pruebas, `website#check`, `website#build`), sin cambios en
  `apps/api`, `auth-client.ts`, migraciones, dependencias ni `.env.example`; texto del registro "No pudimos completar el
  registro. Probá de nuevo." con sus pruebas; formato de `PLAN.md` y `progress/*.md`. Revisión: APROBADO (evidencia arriba).
  No bloqueantes: `VITE_API_URL` sin documentar (va en la Fase 2, T2.4); formato de `.claude/agents/` (D18).
  **Con T1.12 la Fase 1 queda completa.**

- **T1.11 · Tests: completar lo que falte** (aprobada 2026-10-06 tras prueba en el navegador, transmitido por el agente que
  lanzó al coordinador): pruebas de `authSchemas` y de `useSchemaForm`; sesión validada contra `auth.users` (`userExists`
  sincrónico, el semilla cuenta aunque no esté creado); `auth.session` se guarda antes de marcar `currentUser`; mensaje genérico
  ante errores inesperados en login y registro; `SESSION_MESSAGES` → `AUTH_MESSAGES`; `MemoryStorage` en `testStorage.ts`;
  prueba de T1.8 renombrada y email guardado normalizado al buscar; comodín sin aviso `R0100`; rutas en `router/routes.ts`.
  165/165 pruebas. Revisión: APROBADO (evidencia arriba). Texto del registro a cambiar en T1.12 (D17).

- **T1.10 · Registro conectado (crear usuario e ingreso automático)** (aprobada 2026-10-06, transmitido por el agente que
  lanzó al coordinador): acción `register` en `useAuthStore.ts` (error propio `registerError` "Ya existe una cuenta con ese email",
  ingreso automático, `isLoading` compartido sin doble envío), `RegisterForm.vue` con `useSchemaForm` y el store (sin provisorio),
  ruta comodín `catchAllRoute` → home y de ahí el guard. 31 pruebas nuevas; en total 95/95. Revisión: APROBADO (evidencia arriba).
  Desvíos 1–4 aceptados. No bloqueantes a T1.11 (aviso `R0100`, rutas repetidas en la prueba) y a T1.12 (formato de documentos), D16.

- **T1.9 · Sesión con Pinia conectada al login, a la home y a las rutas** (aprobada 2026-10-06, transmitido por el agente que
  lanzó al coordinador): `components/auth/useAuthStore.ts` (store con `currentUser` solo `{ email }`, `isAuthenticated`, `isLoading`,
  `loginError`, `login`/`logout`/`clearError`; sesión en `auth.session` restaurada al cargar; fábrica `defineAuthStore(storage?)`),
  `components/auth/useSchemaForm.ts` (D13), `LoginForm.vue` conectado (sin provisorio), `router/authGuard.ts` + guards en
  `router/index.ts`, `components/auth/UserGreeting.vue` ("Hola, <email>"), `HomeView.vue` y `LogoutButton.vue` (`logout()` +
  `router.replace`). Pruebas: `useAuthStore.test.ts` (30) y `router/authGuard.test.ts` (5); en total 64/64. Revisión: APROBADO
  (evidencia al final). Desvíos 1–6 aceptados. Detalles no bloqueantes repartidos por D15: ruta comodín a T1.10; sesión con email
  inexistente, orden guardar/marcar en `login`, mensaje genérico si falla la verificación, `SESSION_MESSAGES` y `MemoryStorage` a T1.11.

- **T1.8 · Almacenamiento de usuarios en localStorage** (aprobada 2026-10-06, transmitido por el agente que lanzó al coordinador):
  `components/auth/passwordHash.ts` (SHA-256 con sal aleatoria por usuario vía `crypto.subtle`) y `components/auth/userStorage.ts`
  (`auth.users` / `auth.session`, email normalizado, JSON roto = lista vacía, usuario semilla `demo@demo.com` / `demo1234` con hash,
  `verifyCredentials` → `{ email }` o `null`, `addUser` → `null` si el email existe), con 29 pruebas (`passwordHash.test.ts`,
  `userStorage.test.ts`). Revisión: APROBADO (tabla de evidencia al final). No bloqueantes para T1.11: renombrar la prueba
  "la contraseña no se recorta ni distingue mayúsculas"; email guardado a mano en mayúsculas no se encuentra.
- **T1.7 · Home con "Cerrar sesión" (solo visual)** (aprobada 2026-10-06, transmitido por el agente que lanzó al coordinador):
  `components/auth/LogoutButton.vue` (`<button>` con ícono `LogOut` y "Cerrar sesión"; provisorio: solo `router.push` a `login`) y
  `views/HomeView.vue` ("Hola" + botón, centrado). Revisión: APROBADO. Para T1.9: usar `router.replace` al cerrar sesión de verdad.
  Con T1.7 terminó la parte visual de la fase.

- **T1.6 · Formulario de registro y enlaces** (aprobada 2026-10-05): `components/auth/RegisterForm.vue` (valida con
  `registerSchema`, reutiliza FormField/PasswordInput/FormAlert, foco email → contraseña → confirmar, editar la contraseña borra
  "Las contraseñas no coinciden", aviso provisorio D10) y `components/auth/AuthSwitchLink.vue` (pregunta + `RouterLink` por nombre
  de ruta), usado en login y registro. Revisión: APROBADO. Decisión D13: unificar la lógica repetida de los formularios en T1.9/T1.10.
- **T1.5 · Formulario de login en pantalla** (aprobada 2026-10-05): en `components/auth/`, `FormField.vue` (label + control +
  error, ids con `useId`), `PasswordInput.vue` (ojo con `Eye`/`EyeOff`, `aria-label` que cambia, sin `aria-pressed`;
  `autocomplete` configurable), `FormAlert.vue` (`error` con `role="alert"` / `info` con `role="status"`) y `LoginForm.vue`
  (valida con `loginSchema`, foco al primer error, botón con estado "Ingresando...", aviso provisorio D10). Revisión: APROBADO
  (con corrección de `aria-pressed` re-revisada). Provisorio hasta T1.9.
- **T1.4 · Layout de dos columnas** (aprobada 2026-10-05): `components/auth/AuthLayout.vue` (50/50 en escritorio, contenido
  centrado con `max-w-md`, panel oculto en mobile) y `components/auth/AuthSideImage.vue` (props opcionales `src`/`alt`, degradado
  como placeholder, imagen con `object-cover`); Login y Registro usan el layout; `index.html` con `lang="es"`. Revisión: APROBADO.
  Decisión del humano: misma imagen en Login y Registro por ahora (D12).
- **T1.1 · Preparar el frontend** (aprobada 2026-10-05): pinia 4.0.3 y zod 4.6.5 instalados con `vp install`,
  Pinia registrada en `main.ts`, script `check` agregado. El PLAN dice `vp install` en vez de `vp add`.
- **T1.2 · Esquemas de validación con Zod** (aprobada 2026-10-05): `components/auth/authSchemas.ts` con
  `loginSchema`, `registerSchema`, tipos `LoginData`/`RegisterData`, `AUTH_MESSAGES` y `PASSWORD_MIN_LENGTH`.
  Revisión: APROBADO. Pendiente no bloqueante: el "8" del mensaje está escrito a mano en vez de usar `PASSWORD_MIN_LENGTH`.
  Los borrados de `public/favicon.png`, `src/assets/*` y `src/counter.ts` vienen de `vp run cleanup` (lo corrió el humano antes de T1.1).
- **T1.3 · Rutas y pantallas base** (aprobada 2026-10-05): vue-router 5.3.1 instalado con `vp install` (también cambió
  `pnpm-workspace.yaml`); `router/index.ts` con `/`, `/login` y `/register` (`createWebHistory`, sin `#`); `App.vue` solo con
  `<RouterView />`; las tres vistas con su título. Revisión: APROBADO. Pendientes no bloqueantes: vue-router pide vue ≥3.5.34
  y hay 3.5.33 (actualizar Vue en una tarea aparte); `lang="es"` en `index.html` (hecho en T1.4).

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

**Revisión T1.7 (reviewer, 2026-10-05):** APROBADO (falta que el humano pruebe en el navegador).

| Qué                                                                                                                           | Dónde                                                                            | Resultado |
| ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------- |
| Un solo `<h1>` "Hola", sin email                                                                                              | `views/HomeView.vue:9`                                                           | OK        |
| Botón "Cerrar sesión"                                                                                                         | `HomeView.vue:10`; `LogoutButton.vue:17-25`                                      | OK        |
| Lleva a `/login` con `router.push({ name: "login" })`; la ruta `login` existe; `useRouter`/`push` existen en vue-router 5.3.1 | `LogoutButton.vue:12`; `router/index.ts:9`; tipos instalados                     | OK        |
| Provisorio: sin store, localStorage, sesión, guards ni email (nada de T1.8+)                                                  | grep en `src/`                                                                   | OK        |
| `HomeView` sin lógica; `LogoutButton` en su archivo en `components/auth/`                                                     | `HomeView.vue:1-13`                                                              | OK        |
| `type="button"`, foco visible (anillo índigo), accesible con teclado                                                          | `LogoutButton.vue:19-20`                                                         | OK        |
| Ícono `LogOut` existe en lucide-vue-next 1.0.0 y tiene `aria-hidden="true"`                                                   | `LogoutButton.vue:23`                                                            | OK        |
| `<button>` + `router.push` en vez de `RouterLink`: razonable (es una acción; en T1.9 solo se agrega `logout()`)               | `LogoutButton.vue:11-13`                                                         | OK        |
| Solo Tailwind, voseo, estilo coherente con login/registro, sin scroll horizontal a 375 px                                     | `HomeView.vue:6-7`; comparado con `LoginForm.vue:81, 112` y `AuthLayout.vue:7-8` | OK        |
| Alcance: solo cambiaron `LogoutButton.vue` y `HomeView.vue` (más PLAN y progress)                                             | fechas de modificación y `git diff --stat`                                       | OK        |

- Checks (los corrió el reviewer): `vp run website#check` → 23 archivos con formato correcto, sin errores de lint ni de tipos en 19. `vp run website#build` → `vue-tsc` sin errores; 1859 módulos; JS 183,99 kB (62,37 kB comprimido); las clases nuevas están en el CSS generado.
- Bloqueantes: ninguno.
- No bloqueantes: (1) para T1.9, al cerrar sesión de verdad usar `router.replace` en vez de `push`, así "Atrás" no vuelve a la home (anotado en las Notas del PLAN); (2) si la navegación falla, el error no se maneja (hoy no puede pasar porque no hay guards); (3) la home no tiene encabezado ni marca (no lo pide el PLAN).

**Nota del coordinador (2026-10-05):** el reviewer no tiene herramienta de edición; el coordinador copió su informe. **Estado:** T1.7 esperando aprobación del humano (prueba en navegador). Con T1.7 termina la parte visual de la fase; no se empieza T1.8 sin su OK.

**Retomada de sesión (coordinador, 2026-10-06):** el código de T1.7 en disco coincide con lo revisado (`HomeView.vue`, `LogoutButton.vue`);
`vp run website#check` (23 archivos, sin errores) y `vp run website#build` (JS 183,99 kB) vuelven a pasar; sin cambios en `apps/api`
ni en `src/lib`. Sigue esperando la aprobación del humano. Novedad: `.claude/agents/implementer.md` y `reviewer.md` tienen reglas
nuevas sin guardar en git (test automático obligatorio en cada tarea de lógica, el reviewer corre `vp test` completo). Afecta a
T1.8–T1.10 y se superpone con T1.11; se le pregunta al humano cómo ajustar el PLAN. `vp test` funciona en `apps/website` (hoy sin tests).

**Decisiones del humano (2026-10-06, transmitidas por el agente que lanzó al coordinador):** T1.7 aprobada; arrancar T1.8;
pruebas automáticas en cada tarea de lógica y T1.11 solo para completar (D14, PLAN ajustado: T1.8–T1.11); las reglas nuevas
de `.claude/agents/implementer.md` y `reviewer.md` quedan vigentes desde ya (sin commit).

**Revisión T1.8 (reviewer, 2026-10-06):** APROBADO (tarea sin resultado visual; falta el OK del humano).

| Caso (criterio del PLAN)                                                     | Prueba automática                                                                                                          | Resultado |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------- |
| Credenciales correctas → `{ email }`, sin contraseña, hash ni sal            | `userStorage.test.ts` › verifyCredentials › credenciales correctas…                                                        | OK        |
| Contraseña incorrecta → `null`                                               | › contraseña incorrecta devuelve null; › la contraseña no se recorta…                                                      | OK        |
| Email inexistente → `null`                                                   | › email inexistente devuelve null                                                                                          | OK        |
| Ambos fallos dan el mismo resultado                                          | › contraseña incorrecta y email inexistente dan el mismo resultado                                                         | OK        |
| Email con mayúsculas/espacios (alta, búsqueda y verificación)                | › normaliza el email…; › acepta el email con mayúsculas o espacios                                                         | OK        |
| Clave `auth.users` vacía no rompe                                            | › sin la clave no lanza error…                                                                                             | OK        |
| JSON corrupto / no-lista / entradas inválidas no rompen                      | › con JSON roto…; › JSON válido que no es una lista…; › descarta entradas…; verifyCredentials › con JSON roto…             | OK        |
| Usuario semilla `demo@demo.com` / `demo1234` con storage vacío               | usuario semilla › (5 pruebas)                                                                                              | OK        |
| Nada en claro (tampoco la del semilla); solo `email`, `passwordHash`, `salt` | › se guarda con hash y sal…; › nada guardado en claro…                                                                     | OK        |
| Misma contraseña con distinta sal → distinto hash                            | `passwordHash.test.ts` › misma contraseña con distinta sal…; `userStorage.test.ts` › dos usuarios con la misma contraseña… | OK        |
| Email duplicado (incluido el semilla) → `addUser` devuelve `null`            | › no crea un usuario con un email ya registrado…                                                                           | OK        |
| Claves `auth.users` / `auth.session`                                         | claves › usan el prefijo auth.                                                                                             | OK        |

- Pruebas extra del reviewer (script aparte, fuera del repo): valores `""`, `"null"`, `"123"`, `"\"str\""`, `"{}"`, `"[{"` en `auth.users` → no lanzan, queda el semilla; contraseña vacía → `null`; dos `addUser` simultáneos → se guardan los dos; dos altas simultáneas del mismo email → una sola, la otra `null`; `verifyCredentials`/`addUser` devuelven solo la clave `email`.
- Checks (los corrió el reviewer): `vp test` en `apps/website` → 2 archivos, **29/29 pasan** (6 de `passwordHash`, 23 de `userStorage`). `vp run website#check` → 27 archivos con formato correcto, sin errores de lint ni de tipos en 23. `vp run website#build` → `vue-tsc` sin errores, 1859 módulos, JS 183,99 kB (igual que antes: nada lo importa todavía).
- Aislamiento: en `src/` nada fuera de `userStorage.ts`, `passwordHash.ts` y sus tests usa `auth.users`, `auth.session`, `USERS_KEY`, `SESSION_KEY`, `userStorage`, `passwordHash` ni `localStorage`. Sin cambios en `apps/api`, `src/lib`, `package.json` ni lockfile.
- Desvíos declarados: ninguno choca con el PLAN. (1) funciones extra: necesarias para hashear/comparar, OK. (2) `addUser` → `null` si el email existe: es lo que necesita T1.10, OK. (3) Zod para validar lo leído: dentro del stack, OK. (4) JSON roto se reemplaza por la lista con el semilla: consecuencia directa de "tratar como lista vacía" + "crear semilla si no hay usuarios"; aceptable para el prototipo (lo roto no se podía recuperar igual). (5) `getUsers`/`findUserByEmail` devuelven hash y sal: el PLAN solo exige que `verifyCredentials` no los devuelva; queda como regla para T1.9/T1.10: el store solo guarda lo que devuelven `verifyCredentials`/`addUser`.
- Bloqueantes: ninguno.
- No bloqueantes: (a) el nombre de la prueba "la contraseña no se recorta ni distingue mayúsculas" dice lo contrario de lo que comprueba (sí distingue mayúsculas); conviene renombrarla en T1.11. (b) Un usuario guardado a mano con email en mayúsculas no se encuentra (la búsqueda compara contra lo guardado sin normalizar); por la app nunca pasa porque `addUser` normaliza. (c) Sin `Storage` y fuera del navegador lanza `window is not defined` (esperado; en el navegador no pasa).
- Cómo comprobarlo el humano: `cd apps/website && vp test` (o `vp test --reporter=verbose` para ver los 29 nombres).

---

**Revisión T1.9 (reviewer, 2026-10-06):** APROBADO (falta que el humano pruebe en el navegador).

| Caso (criterio del PLAN)                                                                                            | Prueba                                                                                                                                                         | Resultado |
| ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Login correcto → `currentUser` seteado, `isAuthenticated` true, va a `/` con "Hola, <email>"                        | `useAuthStore.test.ts` › login › correcto con demo@demo.com…; script extra (router en memoria) "tras login -> /"; `LoginForm.vue:28-29`, `UserGreeting.vue:10` | OK        |
| Login incorrecto → sin sesión y "Email o contraseña incorrectos" (igual para email inexistente)                     | › contraseña incorrecta…; › email inexistente…; › dan exactamente el mismo resultado; `LoginForm.vue:42` (`FormAlert variant="error"`)                         | OK        |
| `isLoading` true durante y false después (bien o mal); "Ingresando..."; sin doble envío                             | › isLoading (3 pruebas); script extra: doble `submit` → `onSubmit` una sola vez, `isSubmitting` vuelve a false aun si lanza; `LoginForm.vue:33,67,71`          | OK        |
| Sin sesión `/` → `/login`; con sesión `/login` y `/register` → `/`; sin bucles                                      | `authGuard.test.ts` (5); script extra con `createRouter` real + store real (guard con tope de 20 llamadas: nunca se alcanzó)                                   | OK        |
| Recargar mantiene la sesión; logout limpia estado y `auth.session`, vuelve al login y al recargar sigue deslogueado | › al cargar la app de nuevo la sesión se restaura; › logout (3 pruebas); script extra (recarga = Pinia nueva)                                                  | OK        |
| Nada sensible en el store ni en `auth.session`                                                                      | › nada sensible (2 pruebas); script extra: `auth.session` = `{"email":"demo@demo.com"}`                                                                        | OK        |
| Nada provisorio en login, home ni router                                                                            | grep `provisori`/`D10`/`todavía no` en `src/`: solo queda en `RegisterForm.vue` (es de T1.10)                                                                  | OK        |
| `LoginForm.vue` no toca localStorage                                                                                | grep: `localStorage`/`auth.session` solo en `userStorage.ts` y `useAuthStore.ts`                                                                               | OK        |
| Pruebas del store + todas las anteriores en verde                                                                   | `vp test --reporter=verbose` → 4 archivos, **64/64** (6 passwordHash + 23 userStorage + 30 store + 5 guards)                                                   | OK        |
| `website#check` y `website#build`                                                                                   | check: 33 archivos con formato correcto, sin errores en 29; build: `vue-tsc` sin errores, 1866 módulos, JS 190,74 kB (64,86 kB gzip)                           | OK        |

- `useSchemaForm` (script extra, fuera del repo): foco al primer campo con error en orden de `fields`; editar un campo borra solo su error;
  `fieldRef` estable por campo y `ref` en `null` no rompe; `onSubmit` recibe los datos ya transformados (email normalizado);
  con `registerSchema`, `onEdit("password")` puede borrar "Las contraseñas no coinciden" → sirve tal cual para T1.10.
- Alcance: sin cambios en `RegisterForm.vue`, `apps/api`, `src/lib`, `package.json`, `pnpm-lock.yaml` ni `pnpm-workspace.yaml`.
  Logout usa `router.replace` (`LogoutButton.vue:12`).
- Desvíos: (1) `authGuard.ts` + test y `UserGreeting.vue`: aceptables, mejoran testeo y composición. (2) `SESSION_MESSAGES` en el store:
  aceptable (no tocar archivos fuera de la lista); se puede mover a `AUTH_MESSAGES` en T1.11. (3) `defineAuthStore(storage?)`:
  aceptable, mismo patrón que `userStorage`. (4) `router.replace` tras login: correcto. (5) sin mensaje si `verifyCredentials`
  lanza: aceptable por ahora (no lo pide el criterio); queda un error en consola. (6) `MemoryStorage` duplicado: aceptable, unificar en T1.11.
- Bloqueantes: ninguno.
- No bloqueantes (para T1.10/T1.11): (a) `useAuthStore.ts:28-37` restaura cualquier email de `auth.session` sin comprobar que
  exista en `auth.users` (si se edita a mano entra con un email inventado; es un prototipo en el navegador). (b) `useAuthStore.ts:71-72`
  setea `currentUser` antes de `setItem`; si el storage falla al guardar, queda logueado sin persistir y el error sube sin mensaje.
  (c) Si `verifyCredentials` lanza, se ve el formulario sin aviso; conviene un mensaje genérico. (d) Rutas que no existen (`/xyz`)
  muestran pantalla en blanco: no hay ruta comodín (`router/index.ts:8-12`), fuera del criterio.

**Cómo probarlo el humano en el navegador** (correr `vp run dev`; abrir `http://localhost:5173`):

1. DevTools > Application > Local Storage: borrar `auth.session` si existe. Abrir `/` → debe ir a `/login`.
2. Enviar vacío → errores bajo email y contraseña, foco en email. Escribir en un campo → su error desaparece.
3. `demo@demo.com` + `cualquiera` → "Email o contraseña incorrectos" en rojo. Probar `otro@demo.com` + `demo1234` → mismo mensaje.
4. Editar un campo → el mensaje rojo desaparece.
5. `demo@demo.com` / `demo1234` → el botón dice "Ingresando..." (se ve un instante), queda deshabilitado; luego `/` con "Hola, demo@demo.com".
6. Local Storage: `auth.session` = `{"email":"demo@demo.com"}`; en `auth.users` solo `email`, `passwordHash`, `salt` (ninguna "demo1234").
7. Recargar (F5) → sigue en la home con el saludo.
8. Escribir `/login` y luego `/register` en la barra → vuelve a `/`.
9. "Cerrar sesión" → `/login`; `auth.session` ya no está. Botón "Atrás" → no muestra la home (vuelve al login). Recargar → sigue en el login.
10. Poner a mano `auth.session` = `{roto` y recargar → se ve el login sin errores en consola.
11. Comprobación por consola: `cd apps/website && vp test --reporter=verbose` → 64 pruebas en verde.
