# Casos de Uso de Route Craft

## 1. Actores del sistema

- `Visitante`: persona no autenticada que navega por la aplicacion.
- `Usuario autenticado`: persona registrada que puede crear y gestionar sus rutas.
- `Administrador`: usuario con rol `admin` o `master` y estado `verified = true`.
- `Servicios externos`: Nominatim/OpenStreetMap, Overpass y Wikipedia, usados para enriquecer busquedas, lugares e imagenes.

## 2. Inventario general de casos de uso

| ID | Caso de uso | Actor principal |
| --- | --- | --- |
| CU-01 | Registrarse en la aplicacion | Visitante |
| CU-02 | Iniciar sesion | Visitante |
| CU-03 | Buscar ciudades | Visitante |
| CU-04 | Consultar informacion de una ciudad | Visitante |
| CU-05 | Consultar una ruta destacada | Visitante |
| CU-06 | Crear una ruta personalizada | Usuario autenticado |
| CU-07 | Editar una ruta propia | Usuario autenticado |
| CU-08 | Eliminar una ruta propia | Usuario autenticado |
| CU-09 | Consultar perfil y mis rutas | Usuario autenticado |
| CU-10 | Guardar o quitar una ruta destacada de favoritos | Usuario autenticado |
| CU-11 | Consultar rutas favoritas | Usuario autenticado |
| CU-12 | Acceder al panel de administracion | Administrador |
| CU-13 | Buscar usuarios y cambiar su verificacion | Administrador |
| CU-14 | Buscar rutas y marcarlas como destacadas | Administrador |
| CU-15 | Revisar y moderar imagenes aportadas por usuarios | Administrador |

## 3. Fichas resumidas

### CU-01. Registrarse en la aplicacion

- `Actor principal`: Visitante
- `Objetivo`: crear una cuenta para poder guardar rutas y usar funciones privadas.
- `Precondiciones`: no tener sesion iniciada.
- `Flujo principal`:
  1. El visitante abre la pantalla de registro.
  2. Introduce nombre, email, contrasena e imagen de perfil.
  3. El sistema valida el formato y la fortaleza minima de la contrasena.
  4. El sistema guarda el usuario en la base de datos.
- `Postcondicion`: la cuenta queda creada.
- `Flujos alternativos`:
  - Si el email ya existe, el sistema rechaza el registro.
  - Si la contrasena no cumple las reglas, el sistema muestra el error.

### CU-02. Iniciar sesion

- `Actor principal`: Visitante
- `Objetivo`: acceder a su espacio privado.
- `Precondiciones`: tener una cuenta registrada.
- `Flujo principal`:
  1. El visitante abre la pantalla de login.
  2. Introduce email y contrasena.
  3. El sistema valida las credenciales.
  4. El sistema genera la cookie `auth`.
  5. El usuario pasa a estar autenticado en la aplicacion.
- `Postcondicion`: la sesion queda iniciada.
- `Flujos alternativos`:
  - Si las credenciales no son correctas, el sistema no inicia sesion.

### CU-03. Buscar ciudades

- `Actor principal`: Visitante
- `Objetivo`: localizar una ciudad para explorar sus lugares de interes.
- `Precondiciones`: ninguna.
- `Flujo principal`:
  1. El actor abre el buscador.
  2. Escribe el nombre de una ciudad.
  3. El sistema consulta resultados por defecto o remotos.
  4. El sistema muestra las coincidencias disponibles.
- `Postcondicion`: el actor obtiene una lista de ciudades que puede abrir.

### CU-04. Consultar informacion de una ciudad

- `Actor principal`: Visitante
- `Objetivo`: explorar una ciudad, su mapa y sus lugares culturales.
- `Precondiciones`: haber seleccionado una ciudad.
- `Flujo principal`:
  1. El actor entra en la ficha de la ciudad.
  2. El sistema obtiene coordenadas y lugares de interes.
  3. El sistema muestra mapa, puntos relevantes e informacion enriquecida.
  4. El sistema muestra rutas destacadas relacionadas con esa ciudad, si existen.
- `Postcondicion`: la informacion turistica de la ciudad queda consultada.
- `Actores secundarios`: Overpass, OpenStreetMap y Wikipedia.

### CU-05. Consultar una ruta destacada

- `Actor principal`: Visitante
- `Objetivo`: ver una ruta publicada como destacada por el sistema.
- `Precondiciones`: la ruta debe existir y estar marcada como `featured`.
- `Flujo principal`:
  1. El actor accede al detalle de una ruta destacada.
  2. El sistema carga portada, descripcion, estadisticas, mapa e itinerario.
  3. El sistema muestra solo imagenes aprobadas para esa ruta.
- `Postcondicion`: la ruta destacada queda consultada.

### CU-06. Crear una ruta personalizada

- `Actor principal`: Usuario autenticado
- `Objetivo`: guardar un recorrido turistico propio.
- `Precondiciones`: tener sesion iniciada y acceder al creador de rutas.
- `Flujo principal`:
  1. El usuario entra en el creador desde una ciudad.
  2. El sistema carga el mapa y los lugares disponibles.
  3. El usuario selecciona paradas para su itinerario.
  4. El usuario define nombre y descripcion.
  5. Opcionalmente sube imagenes y marca una candidata a portada.
  6. El usuario guarda la ruta.
  7. El sistema registra la ruta asociada al propietario.
- `Postcondicion`: la ruta queda creada en la base de datos.
- `Flujos alternativos`:
  - El usuario puede reorganizar la ruta por proximidad antes de guardarla.
  - Si no hay nombre o no hay paradas, la ruta no se guarda.

### CU-07. Editar una ruta propia

- `Actor principal`: Usuario autenticado
- `Objetivo`: modificar una ruta ya creada por el propio usuario.
- `Precondiciones`: la ruta debe existir y pertenecer al usuario autenticado.
- `Flujo principal`:
  1. El usuario abre el editor de una ruta propia.
  2. El sistema carga datos, paradas e imagenes ya asociadas.
  3. El usuario anade o elimina paradas.
  4. El usuario modifica nombre, descripcion o galeria.
  5. El usuario puede cambiar la imagen candidata a portada.
  6. El sistema guarda los cambios.
- `Postcondicion`: la ruta queda actualizada.
- `Restriccion`: un usuario no puede editar rutas de otros.

### CU-08. Eliminar una ruta propia

- `Actor principal`: Usuario autenticado
- `Objetivo`: borrar una ruta que ya no desea conservar.
- `Precondiciones`: la ruta debe pertenecer al usuario autenticado.
- `Flujo principal`:
  1. El usuario abre el detalle de su ruta.
  2. Elige la opcion de eliminar.
  3. El sistema borra la ruta del usuario.
- `Postcondicion`: la ruta deja de estar disponible en su perfil.

### CU-09. Consultar perfil y mis rutas

- `Actor principal`: Usuario autenticado
- `Objetivo`: revisar sus datos, sus rutas y su actividad guardada.
- `Precondiciones`: tener sesion iniciada.
- `Flujo principal`:
  1. El usuario entra en su perfil.
  2. El sistema muestra cabecera de perfil.
  3. El sistema lista las rutas creadas por el usuario.
  4. El sistema lista las rutas destacadas guardadas como favoritas.
- `Postcondicion`: el usuario consulta su espacio personal.

### CU-10. Guardar o quitar una ruta destacada de favoritos

- `Actor principal`: Usuario autenticado
- `Objetivo`: conservar rutas destacadas para revisarlas despues.
- `Precondiciones`: tener sesion iniciada y estar viendo una ruta destacada.
- `Flujo principal`:
  1. El usuario pulsa el boton de favorito.
  2. El sistema comprueba si la ruta ya estaba guardada.
  3. Si no estaba guardada, la anade a favoritos.
  4. Si ya estaba guardada, la elimina de favoritos.
- `Postcondicion`: el estado de favorito queda actualizado.
- `Restriccion`: solo se pueden guardar como favoritas las rutas destacadas.

### CU-11. Consultar rutas favoritas

- `Actor principal`: Usuario autenticado
- `Objetivo`: recuperar rapidamente rutas destacadas guardadas.
- `Precondiciones`: tener sesion iniciada.
- `Flujo principal`:
  1. El usuario entra en su perfil.
  2. El sistema carga sus favoritos.
  3. El sistema muestra las rutas guardadas con acceso a su detalle.
- `Postcondicion`: el listado de favoritos queda consultado.

### CU-12. Acceder al panel de administracion

- `Actor principal`: Administrador
- `Objetivo`: entrar en el area de gestion global de la aplicacion.
- `Precondiciones`: tener sesion iniciada, rol `admin` o `master` y estado verificado.
- `Flujo principal`:
  1. El administrador accede a `/admin`.
  2. El sistema valida permisos.
  3. El sistema muestra el resumen operativo del panel.
- `Postcondicion`: el panel administrativo queda accesible.
- `Flujos alternativos`:
  - Si no hay sesion, el sistema redirige al login.
  - Si no hay permisos, el sistema redirige al inicio.

### CU-13. Buscar usuarios y cambiar su verificacion

- `Actor principal`: Administrador
- `Objetivo`: revisar usuarios y gestionar su estado de verificacion.
- `Precondiciones`: haber accedido al panel admin.
- `Flujo principal`:
  1. El administrador abre la gestion de usuarios.
  2. Busca por nombre o email.
  3. El sistema muestra el directorio con rol y estado.
  4. El administrador cambia la verificacion de un usuario normal.
- `Postcondicion`: el estado `verified` del usuario queda actualizado.
- `Restriccion`: no se modifica la verificacion de cuentas con rol admin o master desde esta vista.

### CU-14. Buscar rutas y marcarlas como destacadas

- `Actor principal`: Administrador
- `Objetivo`: decidir que rutas pasan a ser visibles como contenido editorial.
- `Precondiciones`: haber accedido al panel admin.
- `Flujo principal`:
  1. El administrador abre el catalogo global de rutas.
  2. Busca por nombre de ruta o propietario.
  3. El sistema muestra autoria, estado destacado y resumen de galeria.
  4. El administrador marca o desmarca una ruta como destacada.
- `Postcondicion`: la ruta cambia su estado `featured`.
- `Efecto`: una ruta destacada puede aparecer en ciudad, detalle destacado y favoritos.

### CU-15. Revisar y moderar imagenes aportadas por usuarios

- `Actor principal`: Administrador
- `Objetivo`: aprobar o rechazar fotos aportadas por los usuarios para una ruta.
- `Precondiciones`: haber accedido al panel admin y existir imagenes en cola.
- `Flujo principal`:
  1. El administrador abre la gestion de imagenes.
  2. El sistema muestra la cola de imagenes pendientes o rechazadas.
  3. El administrador compara la imagen aportada con la portada actual.
  4. El administrador aprueba o rechaza la imagen.
  5. Si la imagen aprobada estaba marcada como portada candidata, el sistema la convierte en portada de la ruta.
- `Postcondicion`: la imagen queda moderada y su estado se actualiza.

## 4. Relaciones utiles para el diagrama

- `CU-04 Consultar informacion de una ciudad` puede conducir a `CU-06 Crear una ruta personalizada`.
- `CU-04 Consultar informacion de una ciudad` puede conducir a `CU-05 Consultar una ruta destacada`.
- `CU-06 Crear una ruta personalizada` incluye seleccionar lugares en el mapa, definir descripcion y guardar la ruta.
- `CU-07 Editar una ruta propia` incluye modificar itinerario, actualizar galeria y cambiar portada candidata.
- `CU-10 Guardar o quitar una ruta destacada de favoritos` depende de `CU-05 Consultar una ruta destacada`.
- `CU-15 Revisar y moderar imagenes aportadas por usuarios` afecta visualmente a `CU-05 Consultar una ruta destacada` y a la portada de rutas.

## 5. Notas importantes para presentarlo bien

- En esta app, `ruta destacada` es el equivalente funcional a la ruta "verificada" que aparece publicada en la parte publica.
- `verified` en usuarios y `featured` en rutas son conceptos distintos.
- El detalle de una ruta propia, su edicion y su borrado solo se permiten al propietario autenticado.
- Las imagenes aportadas por usuarios pasan por un flujo de moderacion antes de mostrarse como aprobadas.
- Los casos de uso de ciudad y lugares dependen de servicios externos, por lo que pueden considerarse actores secundarios en UML.
