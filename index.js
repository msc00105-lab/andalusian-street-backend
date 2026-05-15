/*
 * Fase 3 - Tarea 2 - Aplicación básica con servicio login
 * ASIGNATURA: Servicios y Aplicaciones Telemáticas
 * TITULACIÓN: Grado en Ingeniería de tecnologías de telecomunicación (14312020)
 * TITULACIÓN: Doble Grado Ing. de tecnologías de la telecomunicación e Ing. telemática (15212007)
 * TITULACIÓN: Grado en Ingeniería telemática (14512016)
 * CENTRO: ESCUELA POLITÉCNICA SUPERIOR (LINARES)
 * CURSO ACADÉMICO: 2025-2026
 * AUTOR: Juan Carlos Cuevas Martínez
 */

// Datos del servicio
const VERSION = "1.0"; // Variable para indicar la versión del servicio
const SERVICE_NAME = "Andalusian Street - Servicio de gestión de prendas"; // Reemplazar por el nombre del servicio de cada equipo
const SERVICE_PORT = 8081; // Puerto para el servicio HTTP

// Definición de códigos de estado que emplea la aplicación
const STATUS_OK = 200;
const STATUS_CREATED = 201;
const STATUS_BADFORMAT = 400;
const STATUS_NOTFOUND = 404;
const STATUS_UNAUTHORIZED = 401;
const STATUS_FORBIDDEN = 403;
const STATUS_SERVER_ERROR = 500;

const DB_URL = "mongodb://localhost:27017/";
const DB_NAME = "ssaatt";
const DB_USERS_COLLECTION = "users";
const DB_PRENDAS_COLLECTION = "prendas";

// Definición base de una prenda
const PRENDA_BASE = {
  nombre: "",
  tipo: "",
  material: ""
};

const USER_BASE = {
  user: "",
  password: "",
  name: "",
  surname: "",
  email: ""
};

/* Módulos de Node.js para desplegar el servidor */
const os = require("node:os"); // Módulo de información relativa al sistema operativo y el host
const dns = require("node:dns"); // Módulo para emplear el servicio DNS

const express = require("express"); //Importación del paquete Express
const { MongoClient, ObjectId } = require("mongodb");


const app = new express(); // Creación de la aplicación Express

app.use(express.json()); // Para procesar tipos de datos application/json.
// Esto permite que en el objeto Request (req) se pueda emplear la propiedad req.body para
// acceder a cada propiedad del cuerpo de la petición por su nombre.

//Primer endpoint - Punto de entrada genérico al servidor para guardar registro de las peticiones entrantes
app.use((req, res, next) => {
  console.log("[SERVIDOR] Petición entrante:" + req.method + " " + req.path);
  next(); //Hace que se pase el proceso al siguiente endpoint que coincida
});

/* Servicio de autenticación POST /login
datos:
{
    "user": nombre de usuario,
    "password": clave del usuario
}
*/
app.post("/login", (req, res) => {
  if (req.body === undefined) {
    res.status(STATUS_BADFORMAT).end();
    return;
  }

  if (req.body.user === undefined || req.body.password === undefined) {
    res.status(STATUS_BADFORMAT).end();
    return;
  }

  console.dir(req.body);

  const client = new MongoClient(DB_URL);

  async function run() {
    try {
      const db = client.db(DB_NAME);
      const users = db.collection(DB_USERS_COLLECTION);

      const result = await users.findOne({
        user: req.body.user,
        password: req.body.password
      });

      if (result) {
        res.status(STATUS_OK).json({
          message: "Autenticación correcta",
          _id: result._id,
          user: result.user
        });
      } else {
        res.status(STATUS_UNAUTHORIZED).end();
      }
    } finally {
      await client.close();
    }
  }

  run().catch((ex) => {
    console.error("[SERVIDOR] POST /login: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).end();
  });
});

const vFlecha = (req, res, next) => {
  if (req.body === undefined) {
    res.status(STATUS_BADFORMAT).end();
    return;
  }

  for (let campo in USER_BASE) {
    if (req.body[campo] === undefined) {
      res.status(STATUS_BADFORMAT).end();
      return;
    }
  }

  next();
};

/**
 * Tarea 4.2 Servicio POST /users
 * Inserta los datos de un usuario recibidos en la petición en formato JSON
 * en la base de datos, si su nombre de usuario no existe ya
 */
app.post("/users", vFlecha, function (req, res) {
  console.dir(req.body);

  const client = new MongoClient(DB_URL);

  async function run() {
    try {
      const db = client.db(DB_NAME);
      const users = db.collection(DB_USERS_COLLECTION);

      const buscado = await users.countDocuments({ user: req.body.user });

      if (buscado !== 0) {
        console.log(
          `[SERVIDOR] El usuario ${req.body.user} ya existe en la base de datos`,
        );
        res.status(STATUS_FORBIDDEN).end();
      } else {
        const result = await users.insertOne(req.body);
        console.log(
          `[SERVIDOR] Documento insertado con _id: ${result.insertedId}`,
        );
        res.status(STATUS_CREATED).json({ _id: result.insertedId });
      }
    } finally {
      await client.close();
    }
  }

  run().catch((ex) => {
    console.error("[SERVIDOR] POST /users: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).end();
  });
});

/**
 * Tarea 4.3 Servicio GET /users
 * Recupera los datos de todos los usuarios almacenados en la base de datos
 */
app.get("/users", function (req, res) {
  const client = new MongoClient(DB_URL);

  async function run() {
    try {
      const db = client.db(DB_NAME);
      const users = db.collection(DB_USERS_COLLECTION);

      const cursor = await users.find();
      const result = await cursor.toArray();

      res.json(result);
    } finally {
      await client.close();
    }
  }

  run().catch((ex) => {
    console.error("[SERVIDOR] GET /users: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).end();
  });
});

/**
 * Tarea 4.4 Servicio GET /users/:id
 * Recupera los datos de un usuario específico almacenado en la base de datos
 */
app.get("/users/:id", function (req, res) {
  const client = new MongoClient(DB_URL);

  async function run() {
    try {
      const db = client.db(DB_NAME);
      const users = db.collection(DB_USERS_COLLECTION);

      const id = new ObjectId(req.params.id);
      const result = await users.findOne({ _id: id });

      if (result) {
        res.json(result);
      } else {
        res.status(STATUS_NOTFOUND).end();
      }
    } catch (error) {
      if (error instanceof Error && error.name === "BSONError") {
        console.error("[SERVIDOR] Error en el formato del id: " + error);
        res.status(STATUS_BADFORMAT).json({
          message: "Formato de id inválido",
          error: error.message,
        });
      } else {
        console.error("[SERVIDOR] GET /users/:id: " + error);
        res.status(STATUS_SERVER_ERROR).json({
          message: "Error del servidor",
          error: error.message,
        });
      }
    } finally {
      await client.close();
    }
  }

  run().catch((ex) => {
    console.error("[SERVIDOR] GET /users/:id: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).json({
      message: "Error del servidor",
      error: ex.message,
    });
  });
});

/**
 * Tarea 4.6 Servicio DELETE /users/:id
 * Elimina un usuario específico almacenado en la base de datos
 */
app.delete("/users/:id", function (req, res) {
  const client = new MongoClient(DB_URL);

  async function run() {
    try {
      const db = client.db(DB_NAME);
      const users = db.collection(DB_USERS_COLLECTION);

      const id = new ObjectId(req.params.id);

      const result = await users.deleteOne({ _id: id });

      if (result.acknowledged && result.deletedCount === 1) {
        console.log("[SERVIDOR] Usuario eliminado correctamente.");
        res.status(STATUS_OK).end();
      } else {
        res.status(STATUS_NOTFOUND).end();
      }
    } catch (error) {
      if (error instanceof Error && error.name === "BSONError") {
        console.error("[SERVIDOR] Error en el formato del id: " + error);
        res.status(STATUS_BADFORMAT).json({
          message: "Formato de id inválido",
          error: error.message,
        });
      } else {
        console.error("[SERVIDOR] DELETE /users/:id: " + error);
        res.status(STATUS_SERVER_ERROR).json({
          message: "Error del servidor",
          error: error.message,
        });
      }
    } finally {
      await client.close();
    }
  }

  run().catch((ex) => {
    console.error("[SERVIDOR] DELETE /users/:id: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).json({
      message: "Error del servidor",
      error: ex.message,
    });
  });
});

/**
 * Tarea 4.7 Servicio PUT /users/:id
 * Actualiza un usuario específico almacenado en la base de datos
 */
app.put("/users/:id", function (req, res) {
  const client = new MongoClient(DB_URL);

  async function run() {
    try {
      const db = client.db(DB_NAME);
      const users = db.collection(DB_USERS_COLLECTION);

      const id = new ObjectId(req.params.id);

      if (req.body.user !== undefined || req.body._id !== undefined) {
        console.log("[SERVIDOR] El campo user o _id no se puede modificar.");
        res.status(STATUS_BADFORMAT).json({
          message: "El campo user o _id no se pueden modificar."
        });
      } else {
        const result = await users.updateOne({ _id: id }, { $set: req.body });

        if (result.matchedCount === 1 && result.modifiedCount === 1) {
          console.log("[SERVIDOR] Usuario actualizado correctamente.");
          res.status(STATUS_OK).end();
        } else {
          res.status(STATUS_NOTFOUND).end();
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "BSONError") {
        console.error("[SERVIDOR] Error en el formato del id: " + error);
        res.status(STATUS_BADFORMAT).json({
          message: "Formato de id inválido",
          error: error.message,
        });
      } else {
        console.error("[SERVIDOR] PUT /users/:id: " + error);
        res.status(STATUS_SERVER_ERROR).json({
          message: "Error del servidor",
          error: error.message,
        });
      }
    } finally {
      await client.close();
    }
  }

  run().catch((ex) => {
    console.error("[SERVIDOR] PUT /users/:id: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).json({
      message: "Error del servidor",
      error: ex.message,
    });
  });
});


/* Servicio GET /prendas
Recupera todas las prendas almacenadas en la base de datos
*/
app.get("/prendas", function (req, res) {
  const client = new MongoClient(DB_URL);

  async function run() {
    try {
      const db = client.db(DB_NAME);
      const prendas = db.collection(DB_PRENDAS_COLLECTION);

      const cursor = await prendas.find();
      const result = await cursor.toArray();

      res.json(result);
    } finally {
      await client.close();
    }
  }

  run().catch((ex) => {
    console.error("[SERVIDOR] GET /prendas: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).end();
  });
});

/* Servicio GET /prendas/:id
Recupera una prenda específica almacenada en la base de datos
*/
app.get("/prendas/:id", function (req, res) {
  const client = new MongoClient(DB_URL);

  async function run() {
    try {
      const db = client.db(DB_NAME);
      const prendas = db.collection(DB_PRENDAS_COLLECTION);

      const id = new ObjectId(req.params.id);
      const result = await prendas.findOne({ _id: id });

      if (result) {
        res.json(result);
      } else {
        res.status(STATUS_NOTFOUND).end();
      }
    } catch (error) {
      if (error instanceof Error && error.name === "BSONError") {
        console.error("[SERVIDOR] Error en el formato del id: " + error);
        res.status(STATUS_BADFORMAT).json({
          message: "Formato de id inválido",
          error: error.message,
        });
      } else {
        console.error("[SERVIDOR] GET /prendas/:id: " + error);
        res.status(STATUS_SERVER_ERROR).json({
          message: "Error del servidor",
          error: error.message,
        });
      }
    } finally {
      await client.close();
    }
  }

  run().catch((ex) => {
    console.error("[SERVIDOR] GET /prendas/:id: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).json({
      message: "Error del servidor",
      error: ex.message,
    });
  });
});


/* Servicio POST /prendas
Crea una nueva prenda en la base de datos
*/
app.post("/prendas", (req, res) => {
  if (req.body === undefined) {
    res.status(STATUS_BADFORMAT).end();
    return;
  }

  for (let campo in PRENDA_BASE) {
    if (req.body[campo] === undefined) {
      res.status(STATUS_BADFORMAT).end();
      return;
    }
  }

  console.dir(req.body);

  const client = new MongoClient(DB_URL);

  async function run() {
    try {
      const db = client.db(DB_NAME);
      const prendas = db.collection(DB_PRENDAS_COLLECTION);

      const result = await prendas.insertOne(req.body);

      console.log(
        `[SERVIDOR] Prenda insertada con _id: ${result.insertedId}`,
      );

      res.status(STATUS_CREATED).json({ _id: result.insertedId });
    } finally {
      await client.close();
    }
  }

  run().catch((ex) => {
    console.error("[SERVIDOR] POST /prendas: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).end();
  });
});

/* Servicio PUT /prendas/:id
Modifica una prenda existente en la base de datos
*/
app.put("/prendas/:id", function (req, res) {
  const client = new MongoClient(DB_URL);

  async function run() {
    try {
      const db = client.db(DB_NAME);
      const prendas = db.collection(DB_PRENDAS_COLLECTION);

      const id = new ObjectId(req.params.id);

      if (
        req.body === undefined ||
        req.body.nombre === undefined ||
        req.body.tipo === undefined ||
        req.body.material === undefined ||
        req.body._id !== undefined
      ) {
        res.status(STATUS_BADFORMAT).end();
      } else {
        const result = await prendas.updateOne({ _id: id }, { $set: req.body });

        if (result.matchedCount === 1 && result.modifiedCount === 1) {
          console.log("[SERVIDOR] Prenda actualizada correctamente.");
          res.status(STATUS_OK).end();
        } else {
          res.status(STATUS_NOTFOUND).end();
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "BSONError") {
        console.error("[SERVIDOR] Error en el formato del id: " + error);
        res.status(STATUS_BADFORMAT).json({
          message: "Formato de id inválido",
          error: error.message,
        });
      } else {
        console.error("[SERVIDOR] PUT /prendas/:id: " + error);
        res.status(STATUS_SERVER_ERROR).json({
          message: "Error del servidor",
          error: error.message,
        });
      }
    } finally {
      await client.close();
    }
  }

  run().catch((ex) => {
    console.error("[SERVIDOR] PUT /prendas/:id: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).json({
      message: "Error del servidor",
      error: ex.message,
    });
  });
});


/* Servicio DELETE /prendas/:id
Borra una prenda específica almacenada en la base de datos
*/
app.delete("/prendas/:id", function (req, res) {
  const client = new MongoClient(DB_URL);

  async function run() {
    try {
      const db = client.db(DB_NAME);
      const prendas = db.collection(DB_PRENDAS_COLLECTION);

      const id = new ObjectId(req.params.id);
      const result = await prendas.deleteOne({ _id: id });

      if (result.acknowledged && result.deletedCount === 1) {
        console.log("[SERVIDOR] Prenda eliminada correctamente.");
        res.status(STATUS_OK).end();
      } else {
        res.status(STATUS_NOTFOUND).end();
      }
    } catch (error) {
      if (error instanceof Error && error.name === "BSONError") {
        console.error("[SERVIDOR] Error en el formato del id: " + error);
        res.status(STATUS_BADFORMAT).json({
          message: "Formato de id inválido",
          error: error.message,
        });
      } else {
        console.error("[SERVIDOR] DELETE /prendas/:id: " + error);
        res.status(STATUS_SERVER_ERROR).json({
          message: "Error del servidor",
          error: error.message,
        });
      }
    } finally {
      await client.close();
    }
  }

  run().catch((ex) => {
    console.error("[SERVIDOR] DELETE /prendas/:id: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).json({
      message: "Error del servidor",
      error: ex.message,
    });
  });
});

// Último endpoint por defecto por si la petición no está en el API REST - Error 404
app.use((req, res) => {
  res.status(STATUS_NOTFOUND).end();
});

console.log(`[SERVIDOR] Iniciando servidor HTTP sobre Node.js 
           Servicio ${SERVICE_NAME}
           Versión ${VERSION}           
-------------------------------------------------`);

// Este código emplea el módulo dns y el os para buscar la IP del host
dns.lookup(os.hostname(), 4, function (err, address, family) {
  // 4 para IPv4
  if (err) {
    console.error("[SERVIDOR] Error al obtener la IP del servidor.");
  } else {
    console.log("[SERVIDOR] IP del servidor: " + address.toString());
    // Se inicia el servidor HTTP una vez se ha buscado la IP en el puerto prefijado
    app.listen(SERVICE_PORT, address.toString(), (error) => {
      if (error) {
        console.error(`[SERVIDOR] Error al inicializar: ${error}`);
      } else {
        console.log(
          `[SERVIDOR] Servidor ejecutándose en http://${address}:${SERVICE_PORT}`,
        );
      }
    });
  }
});