# ICC Clash Web

ICC Clash es una aplicación de aprendizaje gamificado de ciencias de la computación para la carrera de Ingeniería en Ciencias Computacionales del CETYS. La aplicación principal fue migrada de Vue 3 + Vite a Next.js con App Router, React y TypeScript, conservando el diseño, las rutas y el backend existente de Firebase.

La implementación Vue anterior se conserva en [`legacy-vue/`](./legacy-vue) para comparación y recuperación durante la validación de la migración.

## Arquitectura

### Antes: Vue + Vite

- Vue 3 con Vue Router y componentes SFC.
- Autenticación del Firebase Web SDK en el navegador.
- Firestore usado directamente desde composables y vistas.
- Estado compartido mediante composables; no había Pinia/Vuex.
- CSS scoped por componente y Lucide para iconos.

### Ahora: Next.js

- Next.js 16 con App Router, React 19 y TypeScript estricto.
- Páginas servidor pequeñas en `app/`; las experiencias interactivas viven en componentes cliente.
- Grupos `(protected)` y `(guest)` para aplicar guards de sesión sin cambiar las URLs.
- Contexto de autenticación en `components/auth/auth-provider.tsx`.
- Hooks React en `hooks/` para perfil, progreso, presencia y partidas en tiempo real.
- Acceso a Firebase y operaciones transaccionales en `lib/`.
- CSS Modules generados a partir de los estilos scoped originales. Tailwind 4 queda disponible globalmente.
- No se añadió un backend HTTP ni se cambiaron las colecciones de Firebase.

```text
app/                     rutas, layouts y metadata de Next.js
components/auth/         sesión y protección de rutas
components/navigation/   navegación inferior compartida
components/pages/        vistas React y sus CSS Modules
hooks/                   suscripciones React a Firebase
lib/firebase/            configuración del Firebase Web SDK
lib/                     presencia, usuarios, invitaciones, quizzes y duelos
types/                   tipos del dominio
legacy-vue/              snapshot ejecutable de la app Vue anterior
```

## Rutas

| URL                 | Acceso        | Vista                                 | Equivalente Vue    |
| ------------------- | ------------- | ------------------------------------- | ------------------ |
| `/`                 | Público       | Landing con acceso a login y registro | `/`                |
| `/login`            | Solo invitado | Inicio de sesión                      | `/login`           |
| `/register`         | Solo invitado | Registro                              | `/register`        |
| `/home`             | Protegido     | Inicio alternativo                    | `/home`            |
| `/dashboard`        | Protegido     | Panel principal                       | `/dashboard`       |
| `/profile`          | Protegido     | Perfil y ajustes                      | `/profile`         |
| `/leaderboard`      | Protegido     | Clasificación                         | `/leaderboard`     |
| `/quiz`             | Protegido     | Reto diario                           | `/quiz`            |
| `/quizzes`          | Protegido     | Catálogo; acepta `?subject=`          | `/quizzes`         |
| `/quizzes/[quizId]` | Protegido     | Quiz dinámico de Firestore            | `/quizzes/:quizId` |
| `/onboarding`       | Protegido     | Flujo inicial de cuatro pasos         | `/onboarding`      |
| `/duel`             | Protegido     | Duelo 1v1; acepta `?matchId=`         | `/duel`            |

Las URLs desconocidas usan el `not-found` de App Router y envían al usuario a `/dashboard`.

## Firebase, sesión y cookies

Se mantiene el Firebase Web SDK y el mismo modelo de datos:

- `users/{uid}`: perfil y presencia.
- `users/{uid}/meta/progress`: XP y progreso por materia.
- `users/{uid}/claims/*`: premios idempotentes.
- `users/{uid}/invites/*`: invitaciones de duelo.
- `quizzes/{quizId}` y `quizzes/{quizId}/questions/*`: quizzes.
- `matches/{matchId}`: estado de duelos en tiempo real.

No se introdujeron cookies propias. Firebase conserva la sesión en almacenamiento administrado por su SDK y `onAuthStateChanged` la restaura en el cliente. Por ese motivo los guards son componentes cliente:

- Una ruta protegida sin sesión redirige a `/register?redirect=<ruta-original>`.
- `/login` y `/register` redirigen a `/dashboard` si ya existe una sesión.
- Login, registro y el botón `Profile → Settings → Sign Out` llaman directamente a Firebase Auth.

No se añadió middleware de autenticación porque el servidor de Next no puede validar esa sesión de navegador sin incorporar Firebase Admin y una cookie de sesión segura, lo que habría cambiado la arquitectura y el backend existentes.

## Variables de entorno

Copia el archivo de ejemplo:

```powershell
Copy-Item .env.example .env.local
```

Configura los valores de la aplicación web en Firebase:

```dotenv
VITE_APIKEY=
VITE_AUTHDOMAIN=
VITE_PROJECTID=
VITE_STORAGEBUCKET=
VITE_MESSAGINGSENDERID=
VITE_APPID=
```

Los nombres `VITE_*` se conservaron para evitar una migración de configuración. `next.config.ts` los expone explícitamente al bundle del navegador; los identificadores de configuración del Firebase Web SDK son públicos y no deben confundirse con claves privadas o credenciales de servicio. Nunca pongas una clave de cuenta de servicio en estas variables.

Si falta una variable, la app muestra una pantalla de configuración en vez de inicializar Firebase con valores inválidos. Los valores se incorporan durante `next build`, así que hay que recompilar después de cambiarlos.

## Desarrollo local

Requiere Node `^20.19.0` o `>=22.12.0`.

```sh
npm install
npm run dev
```

Verificaciones disponibles:

```sh
npm run lint
npm run type-check
npm run build
npm run start
```

## Despliegue en Vercel

1. Importa el repositorio y selecciona la rama `migrate/vue-to-nextjs`.
2. Usa `.` como Root Directory; Vercel detectará Next.js.
3. Configura las seis variables `VITE_*` para Preview y Production.
4. Despliega con el comando predeterminado `npm run build`.
5. En Firebase Authentication, añade los dominios de Preview/Production que deban iniciar sesión a la lista de dominios autorizados.
6. Comprueba las reglas e índices de Firestore para las consultas de presencia, invitaciones, quizzes y partidas.

No se requieren rewrites ni funciones externas para el enrutamiento de App Router.

## Pruebas manuales recomendadas

- Abrir directamente y refrescar cada URL de la tabla.
- Registrar un usuario y confirmar la redirección hacia onboarding/dashboard.
- Cerrar sesión y verificar que una ruta protegida vuelve a registro conservando `redirect`.
- Iniciar sesión y comprobar perfil/progreso en tiempo real.
- Completar un quiz normal y uno perfecto; refrescar y confirmar que el premio no se duplica.
- Filtrar `/quizzes?subject=Programming` y abrir un detalle.
- Abrir dos sesiones de usuario para probar Quick Match, invitación, respuestas, timeout y premio final.
- Verificar los breakpoints móvil y escritorio y la navegación inferior.

## Paridad conocida

- `leaderboard` y buena parte de `profile` siguen usando los mismos datos de demostración que la versión Vue; no se inventó una API nueva.
- El banco de preguntas de duelos continúa embebido en el cliente, como antes.
- Los botones de notificaciones, privacidad, tema y Danger Zone siguen siendo visuales, igual que en la aplicación original.
- Una prueba completa de Auth/Firestore requiere un proyecto Firebase válido y al menos dos cuentas para el duelo.
