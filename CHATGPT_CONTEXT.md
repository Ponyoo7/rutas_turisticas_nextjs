# Contexto Del Proyecto Para ChatGPT

## Objetivo Del Proyecto

`Route Craft` es una aplicacion web para explorar ciudades, consultar lugares de interes culturales y crear rutas turisticas personalizadas sobre un mapa interactivo.

La experiencia principal es:

1. Buscar una ciudad.
2. Ver sus puntos de interes.
3. Crear o editar una ruta propia seleccionando lugares sobre el mapa.
4. Guardar la ruta si el usuario esta autenticado.

## Stack Tecnico

- Framework: `Next.js 16` con `App Router`
- Lenguaje: `TypeScript`
- UI: `React 19`, `Tailwind CSS 4`, componentes tipo `shadcn/ui`
- Estado cliente: `Zustand`
- Mapas: `Leaflet` + `react-leaflet`
- Base de datos: `Neon Postgres` con `@neondatabase/serverless`
- Autenticacion: `JWT` + cookie `auth` + `bcrypt`

## Variables De Entorno

El proyecto usa estas variables:

- `DATABASE_URL`
- `JWT_SECRET`

No hay otras variables `process.env` activas en `src`.

## Estructura Importante

### Rutas App Router

- `src/app/layout.tsx`
  - Layout raiz.
  - Lee la cookie `auth`, valida el token y monta `UserProvider`.
- `src/app/(app)`
  - Zona principal de la aplicacion.
  - Incluye `Navbar` y `Sidebar`.
- `src/app/(auth)`
  - Pantallas de `login` y `register`.
- `src/app/(admin)`
  - Existe, pero hoy son paginas placeholder sin logica real.

### Pantallas Principales

- `src/app/(app)/page.tsx`
  - Home.
  - Muestra ciudades destacadas y, si hay sesion, rutas del usuario.
- `src/app/(app)/buscador/page.tsx`
  - Busqueda de ciudades.
  - Usa ciudades por defecto y resultados remotos de OpenStreetMap.
- `src/app/(app)/ciudad/[name]/page.tsx`
  - Vista de una ciudad.
  - Carga lugares de interes cacheados y los pinta en mapa + tarjetas.
- `src/app/(app)/rutas/crear/page.tsx`
  - Crea o edita rutas.
  - Si recibe `routeId`, entra en modo edicion.
  - Si recibe `city`, carga lugares de esa ciudad.
- `src/app/(app)/rutas/[id]/page.tsx`
  - Detalle de una ruta guardada.
  - Requiere usuario autenticado.
- `src/app/(app)/perfil/page.tsx`
  - Perfil del usuario y listado de sus rutas.

### Server Actions

- `src/actions/user.actions.ts`
  - Registro, login, logout y verificacion de JWT.
- `src/actions/routes.actions.ts`
  - CRUD de rutas del usuario autenticado.

### Servicios Y Estado

- `src/shared/services/locations.service.ts`
  - Integracion con Nominatim, Overpass y Wikipedia.
- `src/shared/services/locations.cached.server.ts`
  - Cache server-side con `unstable_cache`.
- `src/shared/stores/useUserStore.ts`
  - Store global de usuario.
- `src/shared/components/providers/UserProvider.tsx`
  - Sincroniza el usuario validado en servidor con Zustand.

## Flujo De Datos Real

### Autenticacion

1. `login()` busca el usuario en Postgres y compara hash con `bcrypt`.
2. Si es correcto, genera JWT con los datos basicos del usuario.
3. El token se guarda en la cookie HTTP-only `auth`.
4. `src/app/layout.tsx` valida esa cookie en cada carga del layout raiz.
5. `UserProvider` copia el usuario al store de Zustand para los componentes cliente.

### Proteccion De Rutas

- `src/proxy.ts` redirige a `/login` si no hay cookie `auth`.
- Hoy solo protege:
  - `/rutas/crear`
  - `/perfil`
- El detalle `/rutas/[id]` se protege dentro de la propia pagina con `verifyToken()` y `redirect('/login')`.

### Ciudades Y Lugares

1. El buscador usa ciudades por defecto desde `src/shared/consts/data.ts`.
2. Cuando el usuario escribe, `useCitySearch.tsx` consulta Nominatim.
3. La pagina de ciudad usa `getInterestPlacesByNameCached()`.
4. `locations.service.ts` obtiene coordenadas de la ciudad y consulta Overpass.
5. Solo se devuelven lugares con `name` y `wikipedia`.
6. Las tarjetas de lugares enriquecen la informacion consultando Wikipedia.

### Rutas

1. Desde una ciudad se entra a `/rutas/crear?city=...`.
2. `AddToRouteMap.tsx` permite seleccionar lugares desde el mapa.
3. La ruta puede reordenarse con un algoritmo de vecino mas cercano.
4. `saveRoute()` o `updateRoute()` guardan la ruta en Postgres.
5. `getMyRoutes()` y `getMyRouteById()` siempre filtran por el usuario autenticado.

## APIs Externas

### OpenStreetMap / Nominatim

- Se usa para buscar ciudades por nombre.
- Idioma preferido: `es`.

### Overpass

- Se usan varios endpoints por tolerancia a fallos:
  - `maps.mail.ru`
  - `overpass.private.coffee`
  - `overpass-api.de`
- Hay reintentos si responde `429`.
- La consulta busca:
  - `tourism=museum|attraction`
  - `historic=monument|memorial|archaeological_site`

### Wikipedia

- Se usa para resumen e imagen principal.
- Primero intenta encontrar version en espanol del articulo.
- Si no existe, usa el idioma original del tag `wikipedia`.

## Tipos De Datos Clave

### Usuario

Definido en `src/shared/types/user.d.ts`:

- `id`
- `fullname`
- `email`
- `image`

### Ruta

Definido en `src/shared/types/routes.d.ts`:

- `id`
- `user_id`
- `name`
- `places`
- `image`

### Lugar OSM

Definido en `src/shared/types/locations.d.ts`:

- `id`
- `type`
- `lat` / `lon` o `center.lat` / `center.lon`
- `tags`

## Modelo De Datos Inferido

No hay schema SQL en el repo, pero por las Server Actions se deduce este modelo minimo:

### Tabla `users`

- `id`
- `fullname`
- `email`
- `password`
- `image`

Notas:

- `email` parece tener restriccion unica.
- `password` se guarda hasheada con `bcrypt`.

### Tabla `routes`

- `id`
- `user_id`
- `name`
- `places`
- `image`

Notas:

- `user_id` vincula la ruta con su propietario.
- `places` puede volver desde Postgres como JSON serializado o como array ya parseado.
- `normalizePlaces()` en `src/actions/routes.actions.ts` existe precisamente para normalizar ese campo.

## Convenciones Implicitas Del Repo

- Por defecto, los componentes en `app/` son server components salvo que tengan `'use client'`.
- El estado de autenticacion visible en cliente depende de la combinacion `layout.tsx` + `verifyToken()` + `UserProvider` + Zustand.
- Las rutas guardadas almacenan `places` completos, no solo ids.
- Para obtener coordenadas de un lugar se usa `getPlaceCoords()` de `src/lib/utils.ts`.
- Para estadisticas de ruta se usa `getRouteStats()` y se asume velocidad de caminata fija de `5 km/h`.
- La app usa `img` HTML en muchos sitios; `next/image` apenas aparece.

## Limitaciones Y Zonas Incompletas

- No hay tests automatizados en el repo.
- No aparece el esquema SQL de la base de datos en el proyecto.
- El area `admin` esta sin implementar de verdad.
- `src/app/(app)/rutas/page.tsx` es solo una pagina basica.
- La proteccion de rutas no esta centralizada al 100%; parte va en `proxy.ts` y parte dentro de paginas.
- La carga de contenido de lugares depende bastante de servicios externos y puede fallar por rate limit o disponibilidad.

## Riesgos O Puntos Sensibles

- Si se toca autenticacion, revisar siempre:
  - cookie `auth`
  - `verifyToken()`
  - `UserProvider`
  - `useUserStore`
  - `src/proxy.ts`
- Si se toca mapas o rutas, revisar siempre:
  - `getPlaceCoords()`
  - `getDistanceKm()`
  - `getRouteStats()`
  - `AddToRouteMap.tsx`
  - `MapWrapper.tsx`
  - `Map.tsx`
- Si se cambia `next/image`, habra que ampliar `remotePatterns`, porque hoy solo esta permitido `upload.wikimedia.org`.
- `locations.service.ts` mezcla uso server y client; cualquier cambio en cabeceras o fetch puede afectar a ambos entornos.

## Recomendaciones Para ChatGPT Al Trabajar En Este Repo

- No asumir que existe backend REST: la logica principal usa Server Actions.
- No mover autenticacion a middleware sin revisar antes el comportamiento actual de `src/proxy.ts`.
- No reemplazar `places` por ids sin revisar impacto en mapa, estadisticas y detalle de rutas.
- Mantener el estilo visual actual: tonos tierra, tipografia serif para titulos y layout editorial.
- Priorizar cambios pequenos y localizados; muchas pantallas dependen de utilidades compartidas.
- Si un cambio toca datos externos, contemplar cache, errores de red y valores nulos.

## Checklist Rapido Antes De Modificar Algo

1. Identificar si el archivo es server component, client component o server action.
2. Ver si depende de usuario autenticado.
3. Ver si consume `locationsService` o datos guardados en Postgres.
4. Revisar si ya existe una utilidad compartida antes de duplicar logica.
5. Comprobar si el cambio afecta mapa, busqueda, auth o rutas guardadas.

## Prompt Base Recomendado Para ChatGPT

Puedes usar este prompt como punto de partida:

```text
Actua como asistente tecnico del proyecto Route Craft.
Es una app en Next.js 16 con App Router, TypeScript, Zustand, Leaflet, Neon Postgres y autenticacion por JWT en cookie auth.
Antes de proponer cambios, ten en cuenta:
- La logica principal de datos usa Server Actions.
- El usuario autenticado se hidrata desde src/app/layout.tsx hacia Zustand mediante UserProvider.
- Las rutas turisticas guardan un array completo de lugares OSM.
- Los datos de ciudades y lugares vienen de Nominatim, Overpass y Wikipedia.
- src/proxy.ts protege /rutas/crear y /perfil.
- El area admin es placeholder y no debe asumirse implementada.
Cuando respondas, prioriza soluciones compatibles con esta arquitectura y cita los archivos afectados.
```

## Resumen Ejecutivo

Si ChatGPT necesita una imagen mental rapida del proyecto:

- Es una app de rutas turisticas centrada en mapa + lugares culturales.
- La autenticacion se basa en JWT en cookie y estado reflejado en Zustand.
- El dato externo viene de OpenStreetMap y Wikipedia.
- Las rutas del usuario viven en Neon Postgres mediante Server Actions.
- Hay una base solida de producto en buscador, ciudad, creacion de rutas y perfil.
- Admin, testing y documentacion tecnica profunda aun estan poco desarrollados.
