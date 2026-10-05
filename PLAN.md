# Plan de trabajo — [NOMBRE DEL PROYECTO]

Plan vivo. Reglas de método en FLUJO-DE-TRABAJO.md.
El agente ejecuta UNA tarea a la vez y para para revisión. El humano aprueba y manda marcar [x].

## Fase 1 — Login con usuarios en localStorage (solo frontend)

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

- [ ] **T1.4 · Layout de dos columnas: formulario a la izquierda, imagen a la derecha**
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

- [ ] **T1.5 · Formulario de login en pantalla (con validación de campos)**
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

- [ ] **T1.6 · Formulario de registro en pantalla y enlaces entre login y registro**
      Qué es: la pantalla de registro con sus errores, reutilizando las piezas del login.
      Qué hará: - `RegisterForm.vue` (email, contraseña, confirmar contraseña) validado con `registerSchema`, reutilizando
      `FormField`, `PasswordInput`, `FormAlert` y `AuthLayout`. `RegisterView` solo compone `AuthLayout` + `RegisterForm`. - Enlaces cruzados: "¿No tenés cuenta? Registrate" (en login) / "¿Ya tenés cuenta? Iniciá sesión" (en registro). - Misma accesibilidad que el login; `autocomplete="email"` y `autocomplete="new-password"` en las contraseñas. - **Provisorio:** al enviar datos válidos no se crea ningún usuario ni se navega; se muestra con `FormAlert`
      (variante informativa) "Los datos son válidos. El registro todavía no está conectado." Se reemplaza en T1.10
      por el registro real (crear usuario, login automático y redirección a `/`).
      Archivos: `apps/website/src/components/auth/RegisterForm.vue`, `apps/website/src/views/RegisterView.vue`,
      `apps/website/src/components/auth/LoginForm.vue` (solo el enlace)
      Criterio de aceptación: - En `/register`: campos vacíos, email inválido, contraseña de menos de 8 caracteres y contraseñas que no
      coinciden muestran su mensaje de error. - Datos válidos muestran el mensaje provisorio descrito, sin navegar ni guardar nada. - Los enlaces cruzados llevan de login a registro y viceversa. - Textos en voseo rioplatense. - `vp run website#check` y `vp run website#build` pasan.

- [ ] **T1.7 · Home con el botón "Cerrar sesión" (solo visual)**
      Qué es: la pantalla a la que se llega después de entrar, todavía sin sesión real.
      Qué hará: - `views/HomeView.vue` mínima con el saludo y `components/auth/LogoutButton.vue` ("Cerrar sesión"). - **Provisorio:** el saludo dice solo "Hola" (todavía no hay usuario) y "Cerrar sesión" solo lleva a `/login`,
      sin borrar nada. Se reemplaza en T1.9: el saludo pasa a "Hola, <email>" y el botón cierra la sesión de verdad.
      Archivos: `apps/website/src/views/HomeView.vue`, `apps/website/src/components/auth/LogoutButton.vue`
      Criterio de aceptación: - En `/` se ve el saludo y el botón "Cerrar sesión"; tocarlo lleva a `/login`. - Las vistas no contienen lógica de negocio. - Textos en voseo rioplatense. - `vp run website#check` y `vp run website#build` pasan.

- [ ] **T1.8 · Lógica: almacenamiento de usuarios en localStorage**
      Qué es: una capa aislada de la UI que lee y escribe los usuarios en localStorage. Todavía no se conecta a las
      pantallas (eso es T1.9 y T1.10).
      Qué hará: - Funciones `getUsers`, `findUserByEmail`, `addUser` y `verifyCredentials(email, password)` (async). - Claves con prefijo: `auth.users` (lista de usuarios) y `auth.session` (sesión, ver T1.9). - Email normalizado a minúsculas. Si la clave no existe o tiene JSON inválido, se trata como lista vacía (no rompe). - Recibe el `Storage` como parámetro opcional (por defecto `window.localStorage`) para poder testearlo. - Guardar `passwordHash` + `salt` (SHA-256 con sal aleatoria por usuario, vía `crypto.subtle`)
      en lugar de la contraseña en claro. Comparar hasheando la contraseña ingresada. - Usuario semilla de demo `demo@demo.com` / `demo1234`, creado si no hay ningún usuario y guardado con hash
      como los demás.
      Archivos: `apps/website/src/components/auth/userStorage.ts`, `apps/website/src/components/auth/passwordHash.ts`
      Criterio de aceptación (lo verifica el reviewer con un `Storage` en memoria, sin pantallas): - Credenciales correctas → devuelve el usuario **sin** contraseña ni hash. - Contraseña incorrecta o email inexistente → el mismo resultado de fallo (no se distingue cuál falló). - localStorage vacío o con JSON corrupto en `auth.users` no lanza error. - Con localStorage vacío existe el usuario semilla y se puede verificar con `demo@demo.com` / `demo1234`. - Lo guardado nunca contiene una contraseña en claro (tampoco la del usuario semilla). La comprobación en
      DevTools > Application > Local Storage la hace el humano en T1.9, cuando la pantalla ya usa esta capa. - `vp run website#check` pasa.

- [ ] **T1.9 · Lógica: sesión con Pinia conectada al login, a la home y a las rutas**
      Qué es: estado global de la sesión, conectado a las pantallas. **Reemplaza lo provisorio** de T1.3 (rutas sin
      proteger), T1.5 (mensaje provisorio del login) y T1.7 (saludo sin email y botón que solo navega).
      Qué hará: - `useAuthStore` con estado `currentUser` (solo email, nunca contraseña ni hash), getter `isAuthenticated`,
      acción `login(email, password)` que usa T1.8 y deja un error "Email o contraseña incorrectos" si falla,
      y acción `logout()`. - Persistir la sesión en localStorage (`auth.session`, solo el email) y restaurarla al cargar la app. - Estado `isLoading` mientras se procesa el login. - `LoginForm` llama a `useAuthStore().login`; quita el mensaje provisorio. Credenciales incorrectas → `FormAlert`
      (variante de error) con "Email o contraseña incorrectos" (no revela si el email existe). Botón "Ingresando..."
      y deshabilitado mientras `isLoading`. - Guards en el router: sin sesión → `/login`; con sesión y yendo a `/login` o `/register` → `/`; tras login correcto → `/`. - `HomeView` muestra "Hola, <email>"; `LogoutButton` llama a `logout()` y vuelve al login.
      Archivos: `apps/website/src/components/auth/useAuthStore.ts`, `apps/website/src/components/auth/LoginForm.vue`,
      `apps/website/src/components/auth/LogoutButton.vue`, `apps/website/src/views/HomeView.vue`,
      `apps/website/src/router/index.ts`
      Criterio de aceptación: - Login correcto (por ejemplo con el usuario semilla) → `currentUser` queda seteado, `isAuthenticated` es `true`
      y se navega a `/`, donde se ve "Hola, <email>". - Login incorrecto → `currentUser` sigue vacío y se ve "Email o contraseña incorrectos". - `isLoading` es `true` mientras se procesa el login y vuelve a `false` al terminar (bien o mal); el botón muestra
      "Ingresando..." y no hay doble envío. - Al abrir la app sin sesión se ve el login; entrar a `/` sin sesión redirige a `/login`; con sesión, ir a
      `/login` o `/register` redirige a `/`. - Recargar la página mantiene la sesión. Logout limpia el estado y `auth.session`, vuelve al login y, al recargar,
      sigue deslogueado. - Nada sensible (contraseña/hash) en el store ni en `auth.session`; en DevTools > Application > Local Storage
      no aparece ninguna contraseña en claro (tampoco la del usuario semilla). - Ya no queda ningún mensaje ni comportamiento provisorio del login ni de la home. - `LoginForm.vue` no accede a localStorage directamente: solo usa el store y los esquemas. - `vp run website#check` y `vp run website#build` pasan.

- [ ] **T1.10 · Lógica: registro conectado (crear usuario e ingreso automático)**
      Qué es: permitir crear usuarios nuevos de verdad (además del usuario semilla). **Reemplaza lo provisorio** de
      T1.6 (mensaje provisorio del registro).
      Qué hará: - Acción `register` en el store: usa T1.8 y falla con "Ya existe una cuenta con ese email" si el email ya está registrado. - `RegisterForm` llama a `register`; quita el mensaje provisorio; el error de email duplicado se muestra con `FormAlert`. - Tras registrarse: login automático y redirección a `/`.
      Archivos: `apps/website/src/components/auth/useAuthStore.ts`, `apps/website/src/components/auth/RegisterForm.vue`
      Criterio de aceptación: - Registrarse crea el usuario en `auth.users` con hash (sin contraseña en claro), inicia sesión automáticamente
      y redirige a `/`; después de un logout se puede volver a entrar con ese usuario. - Email duplicado (incluido `demo@demo.com`) muestra "Ya existe una cuenta con ese email"; campos vacíos, email
      inválido y contraseñas que no coinciden siguen mostrando su mensaje. - Ya no queda ningún mensaje ni comportamiento provisorio del registro. - Textos en voseo rioplatense. - `vp run website#check` y `vp run website#build` pasan.

- [ ] **T1.11 · Tests unitarios de la lógica de auth**
      Qué es: asegurar la lógica sin depender de la prueba manual.
      Qué hará: tests con `vp test` (importando desde `vite-plus/test`) para `authSchemas`, `userStorage` (con un `Storage`
      en memoria) y el hash. Sin dependencias nuevas.
      Archivos: `apps/website/src/components/auth/*.test.ts`
      Criterio de aceptación: - `vp test` pasa. - Cubre: campos vacíos, email inválido, contraseñas que no coinciden, credenciales correctas/incorrectas,
      JSON corrupto, email duplicado, usuario semilla y que nunca se guarda la contraseña en claro.

- [ ] **T1.12 · Cierre de la fase: verificación final**
      Qué es: confirmar que todo funciona junto y respeta las reglas del proyecto.
      Qué hará: correr el checklist completo y pedir al humano la prueba manual.
      Criterio de aceptación: - `vp run website#check`, `vp run website#build` y `vp test` pasan. - `git diff` sin cambios en `apps/api/`, `apps/website/src/lib/auth-client.ts` ni migraciones. - Sin variables de entorno nuevas (o, si las hay, documentadas en `.env.example`). - No queda nada provisorio de T1.3, T1.5, T1.6 ni T1.7. - Prueba manual del humano con `vp run website#dev`: campos vacíos, credenciales incorrectas, login con el usuario
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

## Esperando decisión del humano

- (nada pendiente por ahora)

## Notas

- Lo provisorio de la parte visual (T1.3, T1.5, T1.6, T1.7) se reemplaza en T1.9 y T1.10; T1.12 verifica que no quede nada.
