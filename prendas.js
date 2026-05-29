const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const router = express.Router();

const STATUS_OK = 200;
const STATUS_CREATED = 201;
const STATUS_BADFORMAT = 400;
const STATUS_NOTFOUND = 404;
const STATUS_SERVER_ERROR = 500;

const DB_URL = "mongodb://localhost:27017/";
const DB_NAME = "ssaatt";
const DB_PRENDAS_COLLECTION = "prendas";

const PRENDA_BASE = {
  nombre: "",
  tipo: "",
  material: ""
};

/* Garment validation middleware.
 *
 * Verifies that:
 * 1. The request body exists.
 * 2. The name field exists.
 * 3. The type field exists.
 * 4. The material field exists.
 * 5. There is no attempt to modify the _id field.
 *
 * If any field is missing or an attempt is made to modify _id, it responds with 400 Bad Format.
 * If everything is correct, it executes next().
 */
/*Exista body en la petición.*/
const validaPrenda = (req, res, next) => {
  if (req.body === undefined) {
    res.status(STATUS_BADFORMAT).end();
    return;
/*Exista el campo nombre,tipo y material*/  }

  for (let campo in PRENDA_BASE) {
    if (req.body[campo] === undefined) {
      res.status(STATUS_BADFORMAT).end();
      return;
    }
  }
/* No se intente modificar el campo _id.*/
  if (req.body._id !== undefined) {
    res.status(STATUS_BADFORMAT).end();
    return;
  }

  next();
};

/*
 * Servicio GET /
 *
 * Ruta real:
 * GET /prendas
 *
 * Retrieves all garments stored in MongoDB.
 */
router.get("/", function (req, res) {
  const client = new MongoClient(DB_URL);

  async function run() {
    try {
      const db = client.db(DB_NAME);
      const prendas = db.collection(DB_PRENDAS_COLLECTION);

      const cursor = await prendas.find();
      const result = await cursor.toArray();

      res.status(STATUS_OK).json(result);
    } finally {
      await client.close();
    }
  }

  run().catch((ex) => {
    console.error("[SERVIDOR] GET /prendas: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).end();
  });
});

/*
 * Servicio GET /:id
 *
 * Ruta real:
 * GET /prendas/:id
 *
 * Retrieves a specific garment by its MongoDB _id identifier.*/
router.get("/:id", function (req, res) {
  const client = new MongoClient(DB_URL);

  async function run() {
    try {
      const db = client.db(DB_NAME);
      const prendas = db.collection(DB_PRENDAS_COLLECTION);

      const id = new ObjectId(req.params.id);
      const result = await prendas.findOne({ _id: id });

      if (result) {
        res.status(STATUS_OK).json(result);
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

/*
 * Servicio POST /
 *
 * Ruta real:
 * POST /prendas
 *
 * Creates a new garment in MongoDB.
 */
router.post("/", validaPrenda, function (req, res) {
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

/*
 * Servicio PUT /:id
 *
 * Ruta real:
 * PUT /prendas/:id
 *
 * Updates an existing garment.
 */
router.put("/:id", validaPrenda, function (req, res) {
  const client = new MongoClient(DB_URL);

  async function run() {
    try {
      const db = client.db(DB_NAME);
      const prendas = db.collection(DB_PRENDAS_COLLECTION);

      const id = new ObjectId(req.params.id);
//a la prenda que queremos cambiar que se actualice sus campos 
      const result = await prendas.updateOne(
        { _id: id },
        { $set: req.body }/*lo que se cambia */
      );

      /*
       * matchedCount indica si se encontró la prenda.
       * modifiedCount indica si realmente cambió algún dato.
       *
       * Usamos matchedCount para que, si la prenda existe pero se envían
       * los mismos datos, no devuelva 404 por error.
       */
      if (result.matchedCount === 1) {
        console.log("[SERVIDOR] Prenda actualizada correctamente.");
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

/*
 * Servicio DELETE /:id
 *
 * Ruta real:
 * DELETE /prendas/:id
 *
 * Elimina una prenda concreta mediante su identificador _id de MongoDB.
 */
router.delete("/:id", function (req, res) {
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

module.exports = router;