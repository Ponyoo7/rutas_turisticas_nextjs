# Route Craft

Este proyecto es una aplicación web para la creación y gestión de rutas turísticas, desarrollada con **Next.js**. Permite a los usuarios buscar ciudades, explorar lugares de interés y crear rutas personalizadas visualizándolas en un mapa interactivo.

## Características Principales

- **Explorador y Buscador de Ciudades:** Busca destinos y visualiza información detallada de los lugares turísticos de cada ciudad.
- **Mapa Interactivo:** Integración con Leaflet para mostrar los puntos de interés y las rutas directamente en el mapa utilizando datos de OpenStreetMap.
- **Gestión de Rutas Personalizadas:** Los usuarios autenticados pueden crear, modificar, visualizar y eliminar sus propias rutas turísticas.
- **Sistema de Usuarios:** Registro e inicio de sesión seguros usando JWT y bcrypt.
- **Perfil de Usuario:** Sección privada para administrar y consultar las rutas guardadas.

## Tecnologías Utilizadas

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS 4](https://tailwindcss.com/) y [Lucide React](https://lucide.dev/) para iconos.
- **Estado Global:** [Zustand](https://github.com/pmndrs/zustand)
- **Mapas:** [Leaflet](https://leafletjs.com/) y [React Leaflet](https://react-leaflet.js.org/)
- **Base de Datos:** [Neon Serverless Postgres](https://neon.tech/) (`@neondatabase/serverless`)
- **Autenticación:** JWT (`jsonwebtoken`) y `bcrypt` integrados en los Server Actions.

## Estructura del Proyecto

El proyecto sigue la arquitectura de **App Router** de Next.js. Las carpetas y módulos más importantes dentro de `src` son:

- `app/(app)`: Rutas principales de la aplicación (buscador, detalles de ciudad, perfil, gestión de rutas).
- `app/(auth)`: Rutas de autenticación (login, registro).
- `actions`: Server Actions para interactuar directamente con la base de datos (manejo de usuarios `user.actions.ts` y rutas `routes.actions.ts`).
- `shared`: Componentes reutilizables, servicios (como `locations.service.ts`), hooks personalizados, types y stores (Zustand).

## Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto en tu entorno local:

1. **Clonar el repositorio:**

   ```bash
   git clone <url-del-repositorio>
   cd rutas_turisticas
   ```

2. **Instalar dependencias:**
   Puedes usar `npm`, `yarn`, `pnpm` o `bun`. El proyecto está configurado principalmente con `pnpm` (tiene archivo `pnpm-lock.yaml`).

   ```bash
   pnpm install
   ```

3. **Configurar las variables de entorno:**
   Crea un archivo `.env.local` en la raíz del proyecto basándote en las variables requeridas por Neon Postgres y JWT. Las variables principales son:

   ```env
   DATABASE_URL="postgresql://<usuario>:<password>@<host>/<database>?sslmode=require"
   JWT_SECRET="tu_secreto_para_jwt"
   ```

4. **Iniciar el servidor de desarrollo:**

   ```bash
   pnpm run dev
   ```

5. **Ver la aplicación:**
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

## 🚀 Despliegue

La aplicación está preparada para ser desplegada en [Vercel](https://vercel.com/), que es la plataforma óptima para aplicaciones Next.js, contando con el soporte para las variables de entorno de Neon Postgres preconfiguradas.
