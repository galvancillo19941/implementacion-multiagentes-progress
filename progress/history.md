# Bitácora del proyecto

Registro de lo que se fue haciendo (se agrega al final, no se borra).

<!-- Formato: AAAA-MM-DD · T-X · qué se hizo · resultado de los checks -->

2026-10-05 · T1.1 · pinia y zod agregados a website (vp install), Pinia registrado en main.ts, script check agregado, import sin uso y link a favicon borrado quitados · website#check y website#build pasan; sin cambios en apps/api
2026-10-05 · T1.1 · revisión: APROBADO · criterios cumplidos; website#check y website#build pasan; sin cambios en apps/api ni auth-client; pendiente: prueba del humano en navegador y correr api#check/api#build por el bump de zod 4.3.6→4.6.5
2026-10-05 · T1.1 · verificación coordinador: api#check y api#build pasan tras el bump de zod · esperando aprobación del humano
2026-10-05 · T1.1 · aprobada por el humano, marcada [x]; PLAN corregido: `vp add` → `vp install <paquete>` dentro de apps/website (intro Fase 1, T1.1, T1.7) · -
2026-10-05 · T1.2 · authSchemas.ts creado: loginSchema/registerSchema + tipos z.infer (Zod 4; email trim+minúsculas, formato vía pipe, coincidencia con refine+when en confirmPassword); 14 casos verificados con script temporal · website#check y website#build pasan; sin cambios en apps/api
2026-10-05 · T1.2 · revisión: APROBADO · criterios cumplidos (25 casos probados con safeParse); Zod 4.6.5 bien usado; website#check y website#build pasan; sin cambios en apps/api; "Confirmá tu contraseña" y las constantes exportadas están bien; no bloqueante: el "8" del mensaje está escrito a mano en vez de usar PASSWORD_MIN_LENGTH (registrado por el coordinador)
2026-10-05 · Fase 1 · PLAN reordenado a pedido del humano: primero lo visual (T1.3–T1.7), después la lógica (T1.8–T1.10), tests (T1.11) y cierre (T1.12); sin código · -
2026-10-05 · T1.2 · aprobada por el humano, marcada [x]; decisiones del reordenamiento aprobadas (Confirmá tu contraseña, aviso provisorio, lógica partida en T1.9/T1.10) · -
2026-10-05 · T1.3 · vue-router 5.3.1 instalado con vp install (dependencies, catalog:); router/index.ts con /, /login y /register (createWebHistory, vistas cargadas directo); registrado en main.ts; App.vue solo <RouterView />; LoginView/RegisterView/HomeView con título; provisorio sin guards (T1.9); aviso: vue-router pide vue ≥3.5.34 y hay 3.5.33 · website#check y website#build pasan; sin cambios en apps/api
2026-10-05 · T1.3 · revisión: APROBADO · vue-router 5.3.1 instalado con vp; las rutas /, /login y /register funcionan con direcciones normales; las tres vistas solo muestran su título, en voseo; check y build pasan; el aviso de que vue-router pide vue ≥3.5.34 no bloquea (se recomienda actualizar Vue en una tarea aparte); falta que el humano pruebe en el navegador (registrado por el coordinador)
2026-10-05 · T1.3 · aprobada por el humano, marcada [x]; no se avanza a T1.4 hasta nuevo OK · -
