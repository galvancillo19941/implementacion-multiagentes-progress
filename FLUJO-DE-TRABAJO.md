# Flujo de trabajo con IA

Cómo se ejecuta el trabajo en este proyecto. Complementa el AGENTS.md/CLAUDE.md del
proyecto (que define el stack y las reglas técnicas). Se trabaja por FASES, con tres roles.

## Los tres roles

- **coordinador** → dirige. Lee el PLAN y el progress, reparte el trabajo, actualiza el progress, para para la aprobación del humano. NO escribe código.
- **implementer** → hace el código de una tarea. No se autoaprueba.
- **reviewer** → revisa la tarea contra su criterio de aceptación. No edita código.

El que hace (implementer) nunca es el que aprueba (reviewer): así sube la calidad.

## El ciclo de una tarea (lo maneja el coordinador)

```
Humano: "Hacé la siguiente tarea del PLAN."
   → Coordinador lee PLAN + progress/ y ubica la siguiente tarea de la fase actual
   → Coordinador delega en el IMPLEMENTER → hace la tarea
   → se registra en progress/ qué se hizo
   → Coordinador delega en el REVIEWER → revisa contra el criterio + corre checks
   → se registra en progress/ el resultado de la revisión
   → si hay problemas: vuelve al implementer y se repite la revisión
   → Coordinador muestra el resumen y PARA
Humano: "Aprobada"
   → Coordinador marca [x] en el PLAN, actualiza progress/, ofrece seguir con la próxima
```

## Trabajo por fases

- El PLAN.md está dividido en Fases (Fase 1, Fase 2, ...). El humano define las fases.
- Se trabaja UNA fase a la vez. El coordinador no pasa a la siguiente fase sin OK del humano.
- Al terminar todas las tareas de una fase, el coordinador avisa "Fase X completa" y para.

## Memoria en disco (progress/)

- `progress/current.md` → estado vivo: en qué fase y tarea se está, qué se hizo, qué falta.
- `progress/history.md` → bitácora (se agrega al final, no se borra): fecha, tarea, qué se hizo, resultado.
- Al retomar una sesión nueva, lo primero es leer `progress/current.md` para no perder el hilo.

## Reglas transversales

- Una tarea a la vez. El humano aprueba antes de marcar [x].
- Verificar de verdad antes de decir "listo" (checks en verde, probar, no asumir).
- Respetar el AGENTS.md/CLAUDE.md del proyecto para todo lo técnico. No inventar. Si falta una decisión, preguntar.
