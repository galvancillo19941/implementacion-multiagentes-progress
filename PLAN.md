# Plan de trabajo — [NOMBRE DEL PROYECTO]

Plan vivo. Reglas de método en FLUJO-DE-TRABAJO.md.
El agente ejecuta UNA tarea a la vez y para para revisión. El humano aprueba y manda marcar [x].

## Fase 1 — Login con usuarios en localStorage (solo frontend) — COMPLETA

> **Fase 1 completa** (2026-10-06): las 12 tareas aprobadas por el humano. 165 pruebas en verde; `website#check` y `website#build` pasan.

Alcance: solo `apps/website`. No se toca `apps/api`, ni la base de datos, ni better-auth
(`apps/website/src/lib/auth-client.ts` queda como está, sin usar). Stack: Vue 3 + TailwindCSS v4 +
Pinia + Zod + vue-router. Dependencias siempre con `vp install <paquete>` corrido dentro de `apps/website` (nunca npm/pnpm; `vp add` no existe en esta versión de vp). Los componentes de la feature van en
`apps/website/src/components/auth/` (store y helpers junto a ellos); las vistas en `src/views/` solo
componen, sin lógica de negocio.

Plan aprobado por el humano el 2026-10-05: todos los extras sugeridos por el coordinador quedaron aceptados
y ya forman parte de las tareas como criterios firmes. Todos los textos visibles de la UI van en voseo
rioplatense ("Ingresá", "Registrate", "Iniciá sesión"). Las decisiones tomadas están al final de esta fase.

> **Nota de seguridad:** guardar usuarios y contraseñas en localStorage NO es seguro: cualquier script
> que corra en la página (o cualquiera con acceso al navegador) puede leerlos. Esto es solo para
> demo/prototipo. Por eso es **obligatorio** no guardar nunca la contraseña en texto plano, sino un hash
> SHA-256 con sal aleatoria por usuario, vía Web Crypto (`crypto.subtle`). Aun así no sirve para
> producción; para eso existe better-auth en el backend.

- [x] **T1.1 · Preparar el frontend (base limpia, dependencias, script check)**
      Qué es: el website todavía muestra la demo del template, no tiene Pinia ni Zod, y no existe el
      script `check` que exige el checklist (`vp run website#check` hoy falla porque no está definido).
      Precondición: el humano corrió `vp run cleanup` antes de empezar; la tarea asume que `App.vue` ya está limpio.
      Qué hará: - Agregar `pinia` y `zod` al workspace `website` con `vp install pinia zod` (dentro de `apps/website`). - Registrar Pinia en `main.ts`. - Agregar `"check": "vp check"` a `apps/website/package.json` (igual que en `apps/api`).
      Archivos: `apps/website/package.json`, `pnpm-lock.yaml`, `apps/website/src/main.ts`
      Criterio de aceptación: - El humano corrió `vp run cleanup` (precondición) y `App.vue` es la plantilla limpia. - `vp run website#check` existe y pasa; `vp run website#build` pasa. - `pinia` y `zod` figuran en `dependencies` de `apps/website/package.json`; nada instalado con npm/pnpm. - La app arranca con Pinia registrado y sin errores en consola (lo verifica el humano con `vp run website#dev`). - `git diff` no muestra cambios en `apps/api/`.

- [x] **T1.2 · Esquemas de validación con Zod**
      Qué es: reglas de validación únicas y reutilizables para los formularios de login y de registro.
      Qué hará: - `loginSchema`: email y contraseña obligatorios, con mensajes claros por campo
      ("El email es obligatorio", "La contraseña es obligatoria"). El email se recorta (trim) y se pasa
      a minúsculas, así " " cuenta como vacío. - Validar formato de email: "Ingresá un email válido". - `registerSchema`: email, contraseña de mínimo 8 caracteres ("La contraseña debe tener al menos 8 caracteres") y
      "confirmar contraseña" que debe coincidir ("Las contraseñas no coinciden"). - Exportar los tipos inferidos (`z.infer`).
      Archivos: `apps/website/src/components/auth/authSchemas.ts`
      Criterio de aceptación: - Con email y/o contraseña vacíos, el esquema devuelve un error por cada campo vacío con su mensaje. - Un email sin formato válido (ej. `hola@`) da "Ingresá un email válido". - `registerSchema` rechaza contraseñas de menos de 8 caracteres y confirmaciones que no coinciden, con su mensaje. - `vp run website#check` pasa.

> **Orden de la fase (pedido por el humano el 2026-10-05):** primero la parte visual (T1.3 a T1.7), que el humano
> puede abrir con `vp run website#dev` y probar en el navegador; después la lógica que la respalda (T1.8 a T1.10),
> que reemplaza lo provisorio; al final tests (T1.11) y cierre (T1.12). Todo lo provisorio está marcado como
> **Provisorio** en la tarea que lo crea y como **Reemplaza lo provisorio** en la tarea que lo quita.

- [x] **T1.3 · Rutas y pantallas base (login, registro y home)**
      Qué es: que existan las tres pantallas y se pueda ir de una a otra escribiendo la dirección, antes de llenarlas.
      Qué hará: - Instalar `vue-router` con `vp install vue-router` (dentro de `apps/website`). - `router/index.ts` con las rutas `/login`, `/register` y `/`, registrado en `main.ts`; `App.vue` pasa a mostrar
      solo la pantalla de la ruta actual (`<RouterView />`). - `views/LoginView.vue`, `views/RegisterView.vue` y `views/HomeView.vue` con un título simple cada una
      ("Iniciá sesión", "Registrate", "Hola"), sin lógica. - **Provisorio:** las rutas todavía no están protegidas (cualquiera entra a `/`) y no hay redirecciones.
      Se reemplaza en T1.9 (guards con la sesión real).
      Archivos: `apps/website/src/router/index.ts`, `apps/website/src/views/LoginView.vue`,
      `apps/website/src/views/RegisterView.vue`, `apps/website/src/views/HomeView.vue`, `apps/website/src/App.vue`,
      `apps/website/src/main.ts`, `apps/website/package.json`, `pnpm-lock.yaml`
      Criterio de aceptación: - `vue-router` figura en `dependencies` de `apps/website/package.json` (instalado con `vp install`, nunca npm/pnpm). - Con `vp run website#dev`, entrar a `/login`, `/register` y `/` muestra cada pantalla con su título, sin errores en consola. - Las vistas no contienen lógica de negocio (solo layout y composición). - Textos en voseo rioplatense. - `vp run website#check` y `vp run website#build` pasan.

- [x] **T1.4 · Layout de dos columnas: formulario a la izquierda, imagen a la derecha**
      Qué es: el diseño pedido, responsive, hecho solo con Tailwind, aplicado a las pantallas de login y registro.
      Qué hará: - `AuthLayout.vue`: pantalla completa; en escritorio (breakpoint `lg`) dos columnas 50/50, con un slot
      para el formulario a la izquierda (centrado, ancho máximo legible) y el panel de imagen a la derecha. - `AuthSideImage.vue`: prop opcional `src` (y `alt`). Sin `src` muestra un panel con degradado de Tailwind
      (placeholder, todavía no hay imagen); con `src` muestra la imagen con `object-cover` ocupando toda su columna.
      Así más adelante se reemplaza por una imagen real sin tocar el layout. - Mobile: la columna de imagen se oculta (`hidden lg:block`). - `LoginView` y `RegisterView` pasan a usar `AuthLayout` (por ahora con su título dentro del slot).
      Archivos: `apps/website/src/components/auth/AuthLayout.vue`, `apps/website/src/components/auth/AuthSideImage.vue`,
      `apps/website/src/views/LoginView.vue`, `apps/website/src/views/RegisterView.vue`
      Criterio de aceptación: - En escritorio, en `/login` y `/register` se ve el contenido a la izquierda y el panel con degradado a la derecha, sin huecos. - Pasar un `src` a `AuthSideImage` muestra la imagen en el mismo lugar sin deformarla ni cambiar el layout
      (lo verifica el reviewer en el código; el humano puede probarlo con una URL de imagen temporal). - En un ancho de ~375 px el panel se oculta y el contenido ocupa el ancho sin scroll horizontal
      (lo verifica el humano con el modo responsive de DevTools). - Solo clases de Tailwind (sin CSS propio ni otras librerías de UI). - `vp run website#check` y `vp run website#build` pasan.

- [x] **T1.5 · Formulario de login en pantalla (con validación de campos)**
      Qué es: el formulario en sí, con los errores de campos vacíos y email inválido usando las reglas de T1.2.
      Qué hará: - `FormField.vue`: label + input + mensaje de error del campo. - `PasswordInput.vue`: input de contraseña con botón "mostrar/ocultar contraseña" (icono de `lucide-vue-next`, ya instalado). - `FormAlert.vue`: mensaje general arriba del formulario. Variante de error (con `role="alert"`, la que usará
      "Email o contraseña incorrectos" en T1.9) y variante informativa (con `role="status"`, usada por lo provisorio). - `LoginForm.vue`: compone lo anterior, valida con `loginSchema` al enviar. `LoginView` solo compone
      `AuthLayout` + `LoginForm`. - Comportamiento: - Enviar con campos vacíos → mensaje bajo cada campo vacío y NO se sigue adelante. - Email con formato inválido → "Ingresá un email válido". - Al corregir un campo, su error desaparece. - El botón ya admite el estado de carga (deshabilitado con texto "Ingresando...", evita doble envío),
      aunque todavía no hay un proceso que tarde. - Accesibilidad: cada input con `<label for>`, `aria-invalid` y `aria-describedby` apuntando a su error;
      errores en región `aria-live="polite"` (el error general con `role="alert"`); foco al primer campo con error;
      `autocomplete="email"` y `autocomplete="current-password"`. - **Provisorio:** al enviar datos válidos no se inicia sesión ni se navega; se muestra con `FormAlert`
      (variante informativa) el mensaje "Los datos son válidos. El ingreso todavía no está conectado." y nada más.
      Se reemplaza en T1.9 por el login real con el store.
      Archivos: `apps/website/src/components/auth/LoginForm.vue`, `FormField.vue`, `PasswordInput.vue`, `FormAlert.vue`
      (todos en `apps/website/src/components/auth/`), `apps/website/src/views/LoginView.vue`
      Criterio de aceptación: - En `/login`: campos vacíos y email inválido muestran su mensaje bajo el campo; al corregir, el error desaparece. - Datos válidos muestran el mensaje provisorio descrito, sin navegar ni guardar nada. - El botón de mostrar/ocultar alterna la visibilidad de la contraseña. - Los atributos de accesibilidad descritos están presentes y el foco va al primer campo con error. - `LoginForm.vue` no accede a localStorage: solo usa los esquemas. - Cada componente en su propio archivo; nada de un único componente monolítico. - Textos en voseo rioplatense. - `vp run website#check` y `vp run website#build` pasan.

- [x] **T1.6 · Formulario de registro en pantalla y enlaces entre login y registro**
      Qué es: la pantalla de registro con sus errores, reutilizando las piezas del login.
      Qué hará: - `RegisterForm.vue` (email, contraseña, confirmar contraseña) validado con `registerSchema`, reutilizando
      `FormField`, `PasswordInput`, `FormAlert` y `AuthLayout`. `RegisterView` solo compone `AuthLayout` + `RegisterForm`. - Enlaces cruzados: "¿No tenés cuenta? Registrate" (en login) / "¿Ya tenés cuenta? Iniciá sesión" (en registro). - Misma accesibilidad que el login; `autocomplete="email"` y `autocomplete="new-password"` en las contraseñas. - **Provisorio:** al enviar datos válidos no se crea ningún usuario ni se navega; se muestra con `FormAlert`
      (variante informativa) "Los datos son válidos. El registro todavía no está conectado." Se reemplaza en T1.10
      por el registro real (crear usuario, login automático y redirección a `/`).
      Archivos: `apps/website/src/components/auth/RegisterForm.vue`, `apps/website/src/views/RegisterView.vue`,
      `apps/website/src/components/auth/LoginForm.vue` (solo el enlace)
      Criterio de aceptación: - En `/register`: campos vacíos, email inválido, contraseña de menos de 8 caracteres y contraseñas que no
      coinciden muestran su mensaje de error. - Datos válidos muestran el mensaje provisorio descrito, sin navegar ni guardar nada. - Los enlaces cruzados llevan de login a registro y viceversa. - Textos en voseo rioplatense. - `vp run website#check` y `vp run website#build` pasan.

- [x] **T1.7 · Home con el botón "Cerrar sesión" (solo visual)**
      Qué es: la pantalla a la que se llega después de entrar, todavía sin sesión real.
      Qué hará: - `views/HomeView.vue` mínima con el saludo y `components/auth/LogoutButton.vue` ("Cerrar sesión"). - **Provisorio:** el saludo dice solo "Hola" (todavía no hay usuario) y "Cerrar sesión" solo lleva a `/login`,
      sin borrar nada. Se reemplaza en T1.9: el saludo pasa a "Hola, <email>" y el botón cierra la sesión de verdad.
      Archivos: `apps/website/src/views/HomeView.vue`, `apps/website/src/components/auth/LogoutButton.vue`
      Criterio de aceptación: - En `/` se ve el saludo y el botón "Cerrar sesión"; tocarlo lleva a `/login`. - Las vistas no contienen lógica de negocio. - Textos en voseo rioplatense. - `vp run website#check` y `vp run website#build` pasan.

- [x] **T1.8 · Lógica: almacenamiento de usuarios en localStorage**
      Qué es: una capa aislada de la UI que lee y escribe los usuarios en localStorage. Todavía no se conecta a las
      pantallas (eso es T1.9 y T1.10).
      Qué hará: - Funciones `getUsers`, `findUserByEmail`, `addUser` y `verifyCredentials(email, password)` (async). - Claves con prefijo: `auth.users` (lista de usuarios) y `auth.session` (sesión, ver T1.9). - Email normalizado a minúsculas. Si la clave no existe o tiene JSON inválido, se trata como lista vacía (no rompe). - Recibe el `Storage` como parámetro opcional (por defecto `window.localStorage`) para poder testearlo. - Guardar `passwordHash` + `salt` (SHA-256 con sal aleatoria por usuario, vía `crypto.subtle`)
      en lugar de la contraseña en claro. Comparar hasheando la contraseña ingresada. - Usuario semilla de demo `demo@demo.com` / `demo1234`, creado si no hay ningún usuario y guardado con hash
      como los demás. - **Pruebas automáticas (D14):** `userStorage.test.ts` y `passwordHash.test.ts` con `vp test` (importando desde
      `vite-plus/test`), usando un `Storage` en memoria. Sin dependencias nuevas.
      Archivos: `apps/website/src/components/auth/userStorage.ts`, `apps/website/src/components/auth/passwordHash.ts`,
      `apps/website/src/components/auth/userStorage.test.ts`, `apps/website/src/components/auth/passwordHash.test.ts`
      Criterio de aceptación (lo verifica el reviewer con un `Storage` en memoria, sin pantallas): - Credenciales correctas → devuelve el usuario **sin** contraseña ni hash. - Contraseña incorrecta o email inexistente → el mismo resultado de fallo (no se distingue cuál falló). - localStorage vacío o con JSON corrupto en `auth.users` no lanza error. - Con localStorage vacío existe el usuario semilla y se puede verificar con `demo@demo.com` / `demo1234`. - Lo guardado nunca contiene una contraseña en claro (tampoco la del usuario semilla). La comprobación en
      DevTools > Application > Local Storage la hace el humano en T1.9, cuando la pantalla ya usa esta capa. - Las pruebas
      automáticas cubren cada punto anterior (casos correctos y de error: credenciales correctas, contraseña incorrecta,
      email inexistente, email con mayúsculas/espacios, clave vacía, JSON corrupto, usuario semilla, nada en claro, misma
      contraseña con distinta sal da distinto hash) y `vp test` pasa en verde. - `vp run website#check` pasa.

- [x] **T1.9 · Lógica: sesión con Pinia conectada al login, a la home y a las rutas**
      Qué es: estado global de la sesión, conectado a las pantallas. **Reemplaza lo provisorio** de T1.3 (rutas sin
      proteger), T1.5 (mensaje provisorio del login) y T1.7 (saludo sin email y botón que solo navega).
      Qué hará: - `useAuthStore` con estado `currentUser` (solo email, nunca contraseña ni hash), getter `isAuthenticated`,
      acción `login(email, password)` que usa T1.8 y deja un error "Email o contraseña incorrectos" si falla,
      y acción `logout()`. - Persistir la sesión en localStorage (`auth.session`, solo el email) y restaurarla al cargar la app. - Estado `isLoading` mientras se procesa el login. - `LoginForm` llama a `useAuthStore().login`; quita el mensaje provisorio. Credenciales incorrectas → `FormAlert`
      (variante de error) con "Email o contraseña incorrectos" (no revela si el email existe). Botón "Ingresando..."
      y deshabilitado mientras `isLoading`. - Guards en el router: sin sesión → `/login`; con sesión y yendo a `/login` o `/register` → `/`; tras login correcto → `/`. - `HomeView` muestra "Hola, <email>"; `LogoutButton` llama a `logout()` y vuelve al login. - Unificar la lógica repetida de los formularios en una función compartida (D13) y usarla en `LoginForm`. - **Pruebas automáticas (D14):** `useAuthStore.test.ts` con `vp test` (Pinia real con `setActivePinia(createPinia())`
      y un `Storage` en memoria; sin dependencias nuevas, sin simulador de navegador).
      Archivos: `apps/website/src/components/auth/useAuthStore.ts`, `apps/website/src/components/auth/useAuthStore.test.ts`, `apps/website/src/components/auth/useSchemaForm.ts` (función compartida, D13), `apps/website/src/components/auth/LoginForm.vue`,
      `apps/website/src/components/auth/LogoutButton.vue`, `apps/website/src/views/HomeView.vue`,
      `apps/website/src/router/index.ts`
      Criterio de aceptación: - Login correcto (por ejemplo con el usuario semilla) → `currentUser` queda seteado, `isAuthenticated` es `true`
      y se navega a `/`, donde se ve "Hola, <email>". - Login incorrecto → `currentUser` sigue vacío y se ve "Email o contraseña incorrectos". - `isLoading` es `true` mientras se procesa el login y vuelve a `false` al terminar (bien o mal); el botón muestra
      "Ingresando..." y no hay doble envío. - Al abrir la app sin sesión se ve el login; entrar a `/` sin sesión redirige a `/login`; con sesión, ir a
      `/login` o `/register` redirige a `/`. - Recargar la página mantiene la sesión. Logout limpia el estado y `auth.session`, vuelve al login y, al recargar,
      sigue deslogueado. - Nada sensible (contraseña/hash) en el store ni en `auth.session`; en DevTools > Application > Local Storage
      no aparece ninguna contraseña en claro (tampoco la del usuario semilla). - Ya no queda ningún mensaje ni comportamiento provisorio del login ni de la home. - `LoginForm.vue` no accede a localStorage directamente: solo usa el store y los esquemas. - Pruebas automáticas
      del store: login correcto e incorrecto, `isLoading` antes/durante/después, sesión guardada y restaurada, logout que
      limpia `auth.session`, nada sensible en el estado ni en `auth.session`; `vp test` pasa en verde (todas las pruebas, también las de T1.8). - `vp run website#check` y `vp run website#build` pasan.

- [x] **T1.10 · Lógica: registro conectado (crear usuario e ingreso automático)**
      Qué es: permitir crear usuarios nuevos de verdad (además del usuario semilla). **Reemplaza lo provisorio** de
      T1.6 (mensaje provisorio del registro).
      Qué hará: - Acción `register` en el store: usa T1.8 y falla con "Ya existe una cuenta con ese email" si el email ya está registrado. - `RegisterForm` llama a `register`; quita el mensaje provisorio; el error de email duplicado se muestra con `FormAlert`. - Tras registrarse: login automático y redirección a `/`. - `RegisterForm` pasa a usar la función compartida de T1.9 (D13). - **Ruta comodín (D15):** cualquier dirección que no existe (por ejemplo `/xyz`) redirige a `/` (y de ahí el guard lleva a `/login` si no hay sesión), en vez de mostrar una pantalla en blanco. - **Pruebas automáticas (D14):** casos de `register` agregados a `useAuthStore.test.ts`.
      Archivos: `apps/website/src/components/auth/useAuthStore.ts`, `apps/website/src/components/auth/useAuthStore.test.ts`, `apps/website/src/components/auth/RegisterForm.vue`,
      `apps/website/src/router/index.ts` (ruta comodín), `apps/website/src/router/authGuard.test.ts` (si la regla de redirección se prueba ahí)
      Criterio de aceptación: - Registrarse crea el usuario en `auth.users` con hash (sin contraseña en claro), inicia sesión automáticamente
      y redirige a `/`; después de un logout se puede volver a entrar con ese usuario. - Email duplicado (incluido `demo@demo.com`) muestra "Ya existe una cuenta con ese email"; campos vacíos, email
      inválido y contraseñas que no coinciden siguen mostrando su mensaje. - Ya no queda ningún mensaje ni comportamiento provisorio del registro. - Pruebas
      automáticas de `register`: crea el usuario con hash y sin contraseña en claro, deja la sesión iniciada, email
      duplicado (también `demo@demo.com` y con otras mayúsculas) falla con su mensaje; `vp test` pasa en verde (todas las pruebas). - Una dirección inexistente (por ejemplo `/xyz`) no muestra pantalla en blanco: sin sesión termina en `/login` y con sesión en `/`, sin bucles de redirección (D15). - Textos en voseo rioplatense. - `vp run website#check` y `vp run website#build` pasan.

- [x] **T1.11 · Tests: completar lo que falte**
      Qué es: asegurar la lógica sin depender de la prueba manual. Desde D14, T1.8, T1.9 y T1.10 traen sus propias
      pruebas; esta tarea solo completa lo que quedó sin cubrir.
      Qué hará: pruebas de `authSchemas` (T1.2 se hizo antes de la regla de pruebas por tarea) y repaso de la cobertura
      de T1.8 a T1.10 para agregar los casos que falten. Con `vp test` (importando desde `vite-plus/test`). Sin dependencias nuevas.
      Pendientes no bloqueantes que se resuelven acá (aprobado por el humano el 2026-10-06): - Al restaurar la sesión, comprobar que el email de `auth.session` exista en `auth.users`; si no existe, sin sesión (`useAuthStore.ts`, lectura de la sesión). - En `login`, guardar primero en `auth.session` y recién después marcar `currentUser`, para que si falla el guardado no quede logueado sin persistir. - Si `verifyCredentials` lanza un error inesperado, el formulario muestra un mensaje genérico en voseo (por ejemplo "No pudimos procesar el ingreso. Probá de nuevo.") en vez de quedar sin aviso. - Mover `SESSION_MESSAGES` (del store) a `AUTH_MESSAGES` en `authSchemas.ts`. - Unificar la clase `MemoryStorage` repetida en las pruebas en un helper de pruebas compartido. - De T1.8: renombrar la prueba "la contraseña no se recorta ni distingue mayúsculas" (dice lo contrario de lo que comprueba) y normalizar el email guardado al buscar (un usuario cargado a mano con mayúsculas hoy no se encuentra). - De T1.10 (aprobado por el humano el 2026-10-06): en la ruta comodín usar `redirect: { name: "home", params: {} }` para que no salga el aviso `[VUE_ROUTER_R0100] Discarded invalid param(s) "pathMatch"` en la consola; y sacar la lista de rutas a `router/routes.ts` (sin crear el router), usada tanto por `router/index.ts` como por `router/authGuard.test.ts`, para que la prueba no repita las rutas a mano. - Cada arreglo con su prueba.
      Archivos: `apps/website/src/components/auth/*.test.ts`, `apps/website/src/components/auth/useAuthStore.ts`, `apps/website/src/components/auth/userStorage.ts`,
      `apps/website/src/components/auth/authSchemas.ts`, `apps/website/src/components/auth/LoginForm.vue` (y `RegisterForm.vue` si usa los mensajes), helper de pruebas compartido,
      `apps/website/src/router/authGuard.ts`, `apps/website/src/router/routes.ts` (nuevo), `apps/website/src/router/index.ts`, `apps/website/src/router/authGuard.test.ts`
      Criterio de aceptación: - `vp test` pasa. - Cubre: campos vacíos, email inválido, contraseñas que no coinciden, credenciales correctas/incorrectas,
      JSON corrupto, email duplicado, usuario semilla y que nunca se guarda la contraseña en claro. - Los nueve pendientes de arriba resueltos, cada uno con su prueba (los siete de T1.8/T1.9 y los dos de T1.10). - Al probar direcciones inexistentes, la salida de `vp test` ya no muestra el aviso `R0100`. - `vp run website#check` y `vp run website#build` pasan.

- [x] **T1.12 · Cierre de la fase: verificación final**
      Qué es: confirmar que todo funciona junto y respeta las reglas del proyecto.
      Qué hará: correr el checklist completo y pedir al humano la prueba manual. Además (D17, aprobado por el humano el 2026-10-06): - Cambiar el texto del mensaje genérico del registro a "No pudimos completar el registro. Probá de nuevo."
      (`AUTH_MESSAGES.registerFailed` en `authSchemas.ts`) y actualizar las pruebas que lo comparan (`authSchemas.test.ts`,
      `useAuthStore.test.ts`). - Ordenar el formato de `PLAN.md` y `progress/*.md` con `vp fmt <archivos>` (solo esos archivos,
      como último paso después de escribir el progress). **No** tocar ni formatear `.claude/agents/`.
      Archivos: `apps/website/src/components/auth/authSchemas.ts`, `apps/website/src/components/auth/authSchemas.test.ts`,
      `apps/website/src/components/auth/useAuthStore.test.ts`, `PLAN.md`, `progress/current.md`, `progress/history.md`
      Criterio de aceptación: - `vp run website#check`, `vp run website#build` y `vp test` pasan. - `git diff` sin cambios en `apps/api/`, `apps/website/src/lib/auth-client.ts` ni migraciones. - Sin variables de entorno nuevas (o, si las hay, documentadas en `.env.example`). - No queda nada provisorio de T1.3, T1.5, T1.6 ni T1.7. - El registro muestra "No pudimos completar el registro. Probá de nuevo." ante un error inesperado (con su prueba) y ya no queda el texto "No pudimos crear la cuenta" en `src/`. - Formato de `PLAN.md` y `progress/*.md` corregido: `vp check` en la raíz solo marca los dos archivos de `.claude/agents/` (que no se tocan, D17); `git diff` no muestra cambios en `.claude/agents/` respecto de antes de la tarea. - Prueba manual del humano con `vp run website#dev`: campos vacíos, credenciales incorrectas, login con el usuario
      semilla, registro de un usuario nuevo, vista mobile, recarga de página y logout.

### Decisiones tomadas (aprobadas por el humano el 2026-10-05)

- **D1 · Limpieza del template:** el humano corre `vp run cleanup` antes de T1.1; T1.1 asume `App.vue` limpio.
- **D2 · Imagen del costado:** no hay imagen todavía; panel con degradado de Tailwind como placeholder, reemplazable luego vía prop `src` de `AuthSideImage.vue`.
- **D3 · Navegación:** `vue-router` con rutas `/login`, `/register` y `/` (protegida), con guards (rutas en T1.3, guards en T1.9).
- **D4 · Origen de los usuarios:** ambos, registro (T1.10) y usuario semilla `demo@demo.com` / `demo1234` guardado con hash (T1.8).
- **D5 · Diseño:** en escritorio formulario a la izquierda e imagen a la derecha; en mobile la imagen se oculta (`hidden lg:block`).
- **D6 · Tras registrarse:** login automático y redirección a `/` (T1.10).
- **D7 · Idioma y tono de la UI:** voseo rioplatense en todos los textos ("Ingresá", "Registrate", "Iniciá sesión").
- **D8 · Orden de la fase:** primero lo visual (T1.3 a T1.7), después la lógica (T1.8 a T1.10), tests y cierre. Pedido por el humano el 2026-10-05.
- **Instalación de paquetes:** `vp install <paquete>` dentro de `apps/website` (`vp add` no existe en esta versión de vp). Aprobado por el humano el 2026-10-05.
- **D9 · Confirmación vacía en el registro:** el mensaje es "Confirmá tu contraseña" (`AUTH_MESSAGES.confirmPasswordRequired`, T1.2).
- **D10 · Envío válido antes de conectar la lógica:** en T1.5 y T1.6 se muestra el aviso informativo "Los datos son válidos. El ingreso todavía no está conectado." / "Los datos son válidos. El registro todavía no está conectado." (no se simula el ingreso). Se reemplaza en T1.9 y T1.10.
- **D11 · Lógica de sesión en dos tareas:** T1.9 (ingreso, sesión, rutas protegidas y logout) y T1.10 (registro).
- **D12 · Imagen del costado por pantalla:** por ahora la misma imagen (hoy el degradado) en Login y Registro; `AuthLayout` no recibe `src`. Si más adelante se quiere una imagen distinta por pantalla, se agrega una prop al layout. Aprobado por el humano el 2026-10-05.
- **D13 · Lógica repetida de los formularios:** `LoginForm` y `RegisterForm` repiten la misma lógica (errores por campo, foco al primer error, borrar error al editar, estado de carga). Se unifica en una función compartida (por ejemplo `useSchemaForm`, junto a los componentes en `components/auth/`) dentro de T1.9 (al conectar el login) y se aplica a `RegisterForm` en T1.10; no es tarea aparte. Aprobado por el humano el 2026-10-05.
- **D14 · Pruebas automáticas por tarea:** desde el 2026-10-06 cada tarea de lógica (T1.8, T1.9, T1.10) trae sus propias
  pruebas con `vp test`, y el reviewer corre todas las pruebas antes de aprobar (reglas nuevas de `.claude/agents/implementer.md`
  y `reviewer.md`, vigentes desde ya). T1.11 queda para completar lo que falte (por ejemplo, `authSchemas`). Las tareas
  visuales no llevan pruebas automáticas. Aprobado por el humano el 2026-10-06.
- **D15 · Detalles no bloqueantes de T1.8 y T1.9:** la ruta comodín (direcciones inexistentes como `/xyz` mostraban pantalla en blanco) se suma a T1.10;
  el resto (sesión con email inexistente, orden guardar/marcar en `login`, mensaje genérico si falla la verificación, mover `SESSION_MESSAGES`,
  `MemoryStorage` repetido y los dos detalles de T1.8) va a T1.11. Aprobado por el humano el 2026-10-06. Comportamiento elegido por el
  coordinador para la ruta comodín: redirigir a `/` (sin pantalla "no encontrada"); el humano puede cambiarlo.

- **D16 · Detalles no bloqueantes de T1.10:** el aviso `R0100` de la ruta comodín y la lista de rutas repetida en la prueba se arreglan en T1.11;
  el formato de los documentos (`vp check` en la raíz) se ordena en T1.12; los archivos de `.claude/agents/` no se tocan sin OK
  explícito del humano. Aprobado por el humano el 2026-10-06 (aceptó las recomendaciones del coordinador).
- **D17 · Cierre de T1.11:** el mensaje genérico ante un error inesperado también va en el registro, con el texto neutro
  "No pudimos completar el registro. Probá de nuevo." (cubre el caso en que la cuenta se creó pero falló guardar la sesión);
  el cambio de texto y su prueba van en T1.12. `.claude/agents/implementer.md` queda como está; `.claude/agents/` sigue sin OK
  para tocarse ni formatearse. Se sigue con el mismo método: el coordinador prepara los pedidos y quien lo lanzó lanza al
  implementer y al reviewer. Aprobado por el humano el 2026-10-06.
- **D18 · Formato de `.claude/agents/`:** el humano autoriza formatear **solo** `.claude/agents/implementer.md` y
  `.claude/agents/reviewer.md`, **solo** con `vp fmt` sobre esos dos archivos y sin cambiar el texto (lo corre quien lanzó al
  coordinador). No autoriza ningún otro cambio en `.claude/agents/` (tampoco en `coordinador.md`). Aprobado por el humano el 2026-10-06.

## Fase 2 — Login en el servidor con better-auth (BORRADOR, pendiente de aprobación)

> **Borrador del coordinador (2026-10-06).** No se empieza ninguna tarea hasta que el humano apruebe el borrador y responda
> las preguntas de "Esperando decisión del humano". Las decisiones elegidas por el coordinador están marcadas como **(propuesta)**.

Qué cambia: hoy los usuarios y la sesión viven en el navegador (Fase 1, solo demo). En esta fase pasan al servidor con
better-auth, que ya está instalado (`apps/api/src/auth.ts`, rutas `/api/auth/{*path}`; cliente en
`apps/website/src/lib/auth-client.ts`, hoy sin usar). La contraseña la guarda better-auth (con hash) en SQLite vía Drizzle; la
sesión pasa a ser una cookie del servidor. Las pantallas de login, registro y home se ven igual que ahora.

Alcance y reglas (CLAUDE.md): `apps/api` y `apps/website`. Base de datos solo con Drizzle y migraciones nuevas (nunca editar
`0000_burly_bruce_banner.sql`; `vp run db:generate && vp run db:migrate`). `express-rate-limit` en todo endpoint que recibe datos
del usuario. Respuestas propias con `{ data }` / `{ error: { message, code } }` (las de better-auth tienen su propio formato:
es la librería, no se reescriben). Toda variable nueva en `.env.example`, incluida `VITE_API_URL`. Estado con Pinia, validación
con Zod, componentes chicos (un archivo por componente). Sin CORS con `origin: "*"`. Dependencias con `vp install <paquete>`
dentro de la app correspondiente. Cada tarea de lógica trae sus pruebas con `vp test` (D14); sin dependencias de pruebas nuevas
(las llamadas al servidor se simulan con `vi.fn`/`vi.mock` de `vite-plus/test`). Orden: primero lo visual, después la lógica (D8).

**(propuesta) Conexión pantalla–servidor en desarrollo:** el servidor de desarrollo del frontend reenvía `/api` al backend
(`server.proxy` en `apps/website/vite.config.ts` → `http://localhost:3001`). Así pantalla y servidor comparten dirección (igual
que en Docker, donde un solo contenedor sirve los dos), la cookie de sesión funciona sin configurar CORS y `VITE_API_URL` queda
opcional (si no está, se usa la misma dirección de la página).

- [ ] **T2.1 · Pantalla de "Cargando..." y botón "Cerrando sesión..." (solo visual)**
      Qué es: con el servidor, abrir la app y cerrar sesión tardan un instante (hay que preguntarle al servidor). Se preparan
      esos estados en pantalla antes de conectar nada.
      Qué hará: - `components/app/AppLoading.vue`: pantalla completa centrada con un indicador y "Cargando...", con
      `role="status"`. - `App.vue` la muestra mientras la sesión no está lista. - `LogoutButton.vue` admite estado de carga
      ("Cerrando sesión...", deshabilitado). - Textos nuevos en `AUTH_MESSAGES`: "No pudimos conectar con el servidor. Probá de
      nuevo en un rato." y "Demasiados intentos. Esperá unos minutos y probá de nuevo." (se usan en T2.5/T2.6). - Si el humano
      decide pedir el nombre (ver preguntas), campo "Nombre" en `RegisterForm` con su regla en `registerSchema`. - **Provisorio:** `App.vue` muestra la pantalla de carga ~500 ms al abrir la app, para poder verla; se reemplaza en T2.5
      por la espera real de la sesión.
      Archivos: `apps/website/src/components/app/AppLoading.vue`, `apps/website/src/App.vue`,
      `apps/website/src/components/auth/LogoutButton.vue`, `apps/website/src/components/auth/authSchemas.ts` (+ su prueba)
      Criterio de aceptación: - Al abrir la app se ve "Cargando..." un instante y después la pantalla que corresponde. - La
      pantalla de carga solo usa Tailwind, se anuncia a lectores de pantalla y no deja scroll horizontal a 375 px. - Las vistas
      no tienen lógica de negocio. - Textos en voseo. - `vp test`, `vp run website#check` y `vp run website#build` pasan.

- [ ] **T2.2 · Preparar el backend (dependencias, app separada del arranque, proxy y pruebas)**
      Qué es: dejar el backend listo para crecer y para probarse solo.
      Qué hará: - `vp install express-rate-limit zod` dentro de `apps/api`. - Separar `apps/api/src/app.ts` (arma la app de
      Express: middlewares y rutas) de `apps/api/src/index.ts` (solo migraciones y `listen`), como pide CLAUDE.md. - Script
      `test` en `apps/api/package.json` y primera prueba: `GET /api/health` responde OK (app levantada en un puerto libre, base
      de datos temporal vía `DB_PATH`). - `server.proxy` de `/api` en `apps/website/vite.config.ts` (propuesta de arriba).
      Archivos: `apps/api/package.json`, `pnpm-lock.yaml`, `apps/api/src/app.ts`, `apps/api/src/index.ts`,
      `apps/api/src/app.test.ts`, `apps/website/vite.config.ts`
      Criterio de aceptación: - `vp run api#check`, `vp run api#build` y las pruebas de `apps/api` pasan; `website#check` pasa. - `index.ts` no tiene lógica de negocio. - Con `vp run dev` (lo corre el humano), `http://localhost:5173/api/health`
      responde lo mismo que `http://localhost:3001/api/health`. - Sin cambios en Docker.

- [ ] **T2.3 · Tablas de better-auth en la base de datos**
      Qué es: better-auth necesita sus tablas (usuarios, sesiones, cuentas y verificaciones); hoy la base solo tiene la tabla
      `users` del template, que better-auth no usa.
      Qué hará: - Agregar a `apps/api/src/db/schema.ts` las tablas que pide better-auth para Drizzle + SQLite (según su
      documentación; se puede generar el esquema con su CLI vía `vp dlx`). - Pasar el esquema al `drizzleAdapter` en `auth.ts`. - Generar una migración nueva con `vp run db:generate` y aplicarla con `vp run db:migrate`. - La tabla `users` del template
      se trata según la decisión del humano (por defecto se deja).
      Archivos: `apps/api/src/db/schema.ts`, `apps/api/src/db/migrations/*` (solo archivos nuevos), `apps/api/src/auth.ts`,
      prueba en `apps/api/src/`
      Criterio de aceptación: - Hay una migración nueva y `0000_burly_bruce_banner.sql` no cambió. - Prueba: sobre una base
      temporal, al arrancar se aplican las migraciones y existen las tablas de better-auth. - Sin SQL escrito a mano. - `vp run api#check` y `vp run api#build` pasan.

- [ ] **T2.4 · Seguridad y configuración del ingreso en el servidor**
      Qué es: proteger los endpoints de ingreso y registro, y dejar la configuración documentada.
      Qué hará: - `express-rate-limit` en `/api/auth/*` (propuesta: 10 intentos de ingreso/registro cada 15 minutos por IP,
      más permisivo para consultar la sesión), con respuesta 429 en formato `{ error: { message, code: "RATE_LIMITED" } }`. - Orígenes de confianza de better-auth desde una variable (propuesta: `BETTER_AUTH_TRUSTED_ORIGINS`, por defecto
      `http://localhost:5173` en desarrollo); nunca `*`. - Contraseña mínima de 8 en el servidor (igual que el formulario). - En producción, sin `BETTER_AUTH_SECRET` el servidor no arranca (hoy solo avisa y usa uno al azar). - `.env.example`
      con todas las variables nuevas, más `VITE_API_URL` (opcional, explicada).
      Archivos: `apps/api/src/auth.ts`, `apps/api/src/app.ts`, `apps/api/src/rateLimit.ts` (nuevo), pruebas en `apps/api/src/`,
      `.env.example`
      Criterio de aceptación: - Pruebas contra la app real con base temporal: registro correcto; ingreso correcto; contraseña
      incorrecta y email inexistente dan el mismo error; email repetido falla; pasar el límite da 429 con el formato de error;
      un origen no confiable es rechazado; ninguna respuesta contiene la contraseña ni su hash. - Variables documentadas en
      `.env.example`. - `vp run api#check` y `vp run api#build` pasan.

- [ ] **T2.5 · Lógica: login, sesión y logout contra el servidor**
      Qué es: la pantalla de login deja de usar el navegador y pasa a usar el servidor. **Reemplaza lo provisorio** de T2.1.
      Qué hará: - `useAuthStore` usa el cliente de better-auth (`lib/auth-client.ts`): `login` con `signIn.email`, `logout`
      con `signOut`, y `init()` que consulta la sesión al abrir la app. - El guard del router espera a `init()` una sola vez;
      mientras tanto se ve `AppLoading`. - Errores del servidor traducidos a voseo: credenciales → "Email o contraseña
      incorrectos"; sin conexión → mensaje de servidor; 429 → "Demasiados intentos...". - `currentUser` sigue guardando solo
      lo necesario (email y, si se decide, nombre). - `LogoutButton` muestra "Cerrando sesión..." mientras espera. - `lib/auth-client.ts`: si no hay `VITE_API_URL`, usar la misma dirección de la página.
      Archivos: `apps/website/src/components/auth/useAuthStore.ts` (+ prueba), `apps/website/src/router/index.ts`,
      `apps/website/src/App.vue`, `apps/website/src/components/auth/LogoutButton.vue`, `apps/website/src/lib/auth-client.ts`
      Criterio de aceptación: - Pruebas del store con el cliente simulado: ingreso correcto e incorrecto, sin conexión, 429,
      `isLoading`, sesión restaurada por `init()`, logout. - Con el servidor (lo prueba el humano): entrar, recargar y seguir
      adentro; cerrar sesión; reiniciar el servidor con `BETTER_AUTH_SECRET` fijo y seguir adentro. - En DevTools ya no se
      escribe `auth.session` en Local Storage; la sesión es una cookie. - `vp test`, `website#check` y `website#build` pasan.

- [ ] **T2.6 · Lógica: registro contra el servidor**
      Qué es: crear cuentas nuevas en el servidor.
      Qué hará: - `register` usa `signUp.email` (con el nombre según la decisión del humano); email repetido → "Ya existe una
      cuenta con ese email"; error inesperado → "No pudimos completar el registro. Probá de nuevo."; después de registrarse
      queda adentro y va a `/`.
      Archivos: `apps/website/src/components/auth/useAuthStore.ts` (+ prueba), `apps/website/src/components/auth/RegisterForm.vue`
      Criterio de aceptación: - Pruebas del store con el cliente simulado: registro correcto, email repetido (también con
      otras mayúsculas), sin conexión, 429. - Con el servidor: registrarse, cerrar sesión y volver a entrar; el usuario aparece
      en la base (`vp run db:studio`) sin contraseña en claro. - `vp test`, `website#check` y `website#build` pasan.

- [ ] **T2.7 · Quitar el almacenamiento en el navegador de la Fase 1**
      Qué es: borrar lo que ya no se usa para que no quede código ni datos viejos.
      Qué hará: - Borrar `userStorage.ts`, `passwordHash.ts`, `testStorage.ts` y sus pruebas, y el usuario semilla del
      navegador. - Según la decisión del humano, al abrir la app se borran una vez las claves viejas `auth.users` y
      `auth.session` del navegador.
      Archivos: `apps/website/src/components/auth/*` (borrados), `apps/website/src/components/auth/useAuthStore.ts`
      Criterio de aceptación: - `grep` de `localStorage`, `auth.users` y `passwordHash` en `apps/website/src` sin resultados
      (salvo la limpieza de claves viejas, si se decide). - `vp test`, `website#check` y `website#build` pasan.

- [ ] **T2.8 · Cierre de la fase: verificación final**
      Qué es: confirmar que todo funciona junto, también en Docker.
      Qué hará: correr todos los checks y pedir al humano la prueba manual.
      Criterio de aceptación: - `vp check` en la raíz, `api#check`, `api#build`, `website#check`, `website#build` y las
      pruebas de las dos apps pasan. - Migraciones nuevas generadas y aplicadas; ninguna migración vieja modificada. - Variables nuevas en `.env.example`. - Rate limit en todos los endpoints que reciben datos. - Prueba manual del humano
      con `vp run dev`: registro, ingreso, error de credenciales, recarga, logout, demasiados intentos, servidor apagado
      (mensaje de conexión), vista mobile. - Prueba en Docker (la corre el humano): `docker compose up --build`, ingresar en
      `http://localhost:3001` y que `/api/health` responda.

## Esperando decisión del humano

Para la Fase 2 (borrador):

1. Aprobar el borrador de la Fase 2 (o pedir cambios).
2. Nombre al registrarse: better-auth exige un nombre por cuenta. Opciones: agregar el campo "Nombre" (y saludar con el
   nombre) o no pedirlo y guardar como nombre la parte del email antes de la @. Recomendación: no pedirlo por ahora.
3. Usuario de prueba `demo@demo.com`: crearlo solo en desarrollo o eliminarlo. Recomendación: eliminarlo (registrarse lleva
   segundos y evita una contraseña conocida en el código).
4. Usuarios guardados en el navegador en la Fase 1: no se pueden pasar al servidor. Opciones: que la app los borre del
   navegador al abrir, o dejarlos. Recomendación: borrarlos (T2.7).
5. Tabla `users` del template (sin uso): dejarla o quitarla con una migración nueva. Recomendación: dejarla por ahora.

## Notas

- Lo provisorio de la parte visual (T1.3, T1.5, T1.6, T1.7) se reemplaza en T1.9 y T1.10; T1.12 verifica que no quede nada.
- Para T1.9 (sugerencia del reviewer en T1.7): `LogoutButton` ya es un `<button>` que navega con `router.push`; al conectar `logout()`, usar `router.replace({ name: "login" })` para que "Atrás" no vuelva a la home. (Hecho en T1.9.)
