# Andalusian Street - Back-end

Proyecto back-end desarrollado para la asignatura Servicios y Aplicaciones Telemáticas.

## Descripción del proyecto

Andalusian Street es una aplicación orientada a la gestión de prendas dentro de un servicio de moda sostenible.

En esta fase se desarrolla el back-end de la aplicación utilizando Node.js, Express y MongoDB.

El servidor permite:

- Registrar usuarios.
- Autenticar usuarios.
- Consultar usuarios.
- Modificar usuarios.
- Eliminar usuarios.
- Crear prendas.
- Consultar prendas.
- Modificar prendas.
- Eliminar prendas.

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB
- JavaScript
- MongoDB Compass
- Postman
- GitHub

## Estructura del proyecto

SSAATT-2526-BE-AndalusianStreet/

- index.js
- package.json
- package-lock.json
- .gitignore
- README.md

## Instalación de dependencias

Para instalar las dependencias necesarias del proyecto se debe ejecutar:

npm install

Las dependencias principales utilizadas son:

npm install express

npm install mongodb

## Ejecución del servidor

Para ejecutar el servidor se debe usar:

node index.js

El servidor se ejecuta en el puerto:

8081

Cuando se inicia correctamente, aparece un mensaje parecido a:

[SERVIDOR] Servidor ejecutándose en http://IP_DEL_SERVIDOR:8081

## Base de datos

El proyecto utiliza MongoDB local.

URL de conexión:

mongodb://localhost:27017/

Nombre de la base de datos:

ssaatt

Colecciones utilizadas:

- users
- prendas

# Servicios disponibles de la API

## POST /login

Servicio de autenticación de usuarios.

### Datos enviados

{
  "user": "pablo1",
  "password": "1234"
}

### Respuestas posibles

- 200 OK: autenticación correcta.
- 400 Bad Format: faltan campos obligatorios en la petición.
- 401 Unauthorized: usuario o contraseña incorrectos.
- 500 Server Error: error interno del servidor.

---

## POST /users

Servicio para registrar un nuevo usuario.

### Datos enviados

{
  "user": "pablo1",
  "password": "1234",
  "name": "Pablo",
  "surname": "Cabrera",
  "email": "pablo1@gmail.com"
}

### Respuestas posibles

- 201 Created: usuario creado correctamente.
- 400 Bad Format: faltan campos obligatorios.
- 403 Forbidden: el usuario ya existe en la base de datos.
- 500 Server Error: error interno del servidor.

---

## GET /users

Servicio para obtener todos los usuarios almacenados en la base de datos.

### Datos enviados

No requiere cuerpo de petición.

### Respuestas posibles

- 200 OK: devuelve un array JSON con todos los usuarios.
- 500 Server Error: error interno del servidor.

---

## GET /users/:id

Servicio para obtener un usuario concreto mediante su identificador de MongoDB.

### Ejemplo de ruta

/users/69fa268623a34176b025d910

### Datos enviados

El identificador se envía en la propia URL.

### Respuestas posibles

- 200 OK: devuelve el usuario encontrado.
- 400 Bad Format: el formato del identificador no es válido.
- 404 Not Found: no existe ningún usuario con ese identificador.
- 500 Server Error: error interno del servidor.

---

## PUT /users/:id

Servicio para actualizar un usuario concreto.

### Ejemplo de ruta

/users/69fa268623a34176b025d910

### Datos enviados

{
  "password": "4321",
  "name": "Pablo Actualizado",
  "surname": "Cabrera",
  "email": "pabloactualizado@gmail.com"
}

### Respuestas posibles

- 200 OK: usuario actualizado correctamente.
- 400 Bad Format: datos incorrectos o intento de modificar user o _id.
- 404 Not Found: usuario no encontrado.
- 500 Server Error: error interno del servidor.

---

## DELETE /users/:id

Servicio para eliminar un usuario concreto.

### Ejemplo de ruta

/users/69fa268623a34176b025d910

### Datos enviados

El identificador se envía en la propia URL.

### Respuestas posibles

- 200 OK: usuario eliminado correctamente.
- 400 Bad Format: el formato del identificador no es válido.
- 404 Not Found: usuario no encontrado.
- 500 Server Error: error interno del servidor.

---

## GET /prendas

Servicio para obtener todas las prendas almacenadas en la base de datos.

### Datos enviados

No requiere cuerpo de petición.

### Respuestas posibles

- 200 OK: devuelve un array JSON con todas las prendas.
- 500 Server Error: error interno del servidor.

---

## GET /prendas/:id

Servicio para obtener una prenda concreta mediante su identificador de MongoDB.

### Ejemplo de ruta

/prendas/69fa268623a34176b025d910

### Datos enviados

El identificador se envía en la propia URL.

### Respuestas posibles

- 200 OK: devuelve la prenda encontrada.
- 400 Bad Format: el formato del identificador no es válido.
- 404 Not Found: no existe ninguna prenda con ese identificador.
- 500 Server Error: error interno del servidor.

---

## POST /prendas

Servicio para crear una nueva prenda.

### Datos enviados

{
  "nombre": "Camiseta verde",
  "tipo": "Camiseta",
  "material": "Algodón"
}

### Respuestas posibles

- 201 Created: prenda creada correctamente.
- 400 Bad Format: faltan campos obligatorios.
- 500 Server Error: error interno del servidor.

---

## PUT /prendas/:id

Servicio para actualizar una prenda concreta.

### Ejemplo de ruta

/prendas/69fa268623a34176b025d910

### Datos enviados

{
  "nombre": "Chaqueta azul",
  "tipo": "Chaqueta",
  "material": "Lana"
}

### Respuestas posibles

- 200 OK: prenda actualizada correctamente.
- 400 Bad Format: datos incorrectos o formato de id inválido.
- 404 Not Found: prenda no encontrada.
- 500 Server Error: error interno del servidor.

---

## DELETE /prendas/:id

Servicio para eliminar una prenda concreta.

### Ejemplo de ruta

/prendas/69fa268623a34176b025d910

### Datos enviados

El identificador se envía en la propia URL.

### Respuestas posibles

- 200 OK: prenda eliminada correctamente.
- 400 Bad Format: el formato del identificador no es válido.
- 404 Not Found: prenda no encontrada.
- 500 Server Error: error interno del servidor.

## Autores

Equipo Andalusian Street.