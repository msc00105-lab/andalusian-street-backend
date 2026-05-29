// Import Express package to create a Router.
const express = require("express");

// MongoClient allows connecting to MongoDB.
// ObjectId allows working with MongoDB _id identifiers.
const { MongoClient, ObjectId } = require("mongodb");

// Creation of the users router.
const router = express.Router();

// Definition of HTTP status codes used by this router.
const STATUS_OK = 200;
const STATUS_CREATED = 201;
const STATUS_BADFORMAT = 400;
const STATUS_NOTFOUND = 404;
const STATUS_FORBIDDEN = 403;
const STATUS_SERVER_ERROR = 500;

// MongoDB connection constants.
const DB_URL = "mongodb://localhost:27017/";
const DB_NAME = "ssaatt";
const DB_USERS_COLLECTION = "users";

// Base object to check that users have all required fields.
const USER_BASE = {
  user: "",
  password: "",
  name: "",
  surname: "",
  email: ""
};

/*
 * User validation middleware.
 * Checks that the request has a body and includes all necessary fields.
 */
const validaUser = (req, res, next) => {
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

/*
 * POST / service
 * Real route: POST /users
 * Registers a new user if one with the same 'user' field does not already exist.
 */
router.post("/", validaUser, function (req, res) {
  console.dir(req.body);

  const client = new MongoClient(DB_URL);

  async function run() {
    try {
      const db = client.db(DB_NAME);
      const users = db.collection(DB_USERS_COLLECTION);

      const buscado = await users.countDocuments({ user: req.body.user });

      if (buscado !== 0) {
        console.log(
          `[SERVER] User ${req.body.user} already exists in the database`,
        );
        res.status(STATUS_FORBIDDEN).end();
      } else {
        const result = await users.insertOne(req.body);

        console.log(
          `[SERVER] Document inserted with _id: ${result.insertedId}`,
        );

        res.status(STATUS_CREATED).json({ _id: result.insertedId });
      }
    } finally {
      await client.close();
    }
  }

  run().catch((ex) => {
    console.error("[SERVER] POST /users: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).end();
  });
});

/*
 * GET / service
 * Real route: GET /users
 * Returns all users stored in MongoDB.
 */
router.get("/", function (req, res) {
  const client = new MongoClient(DB_URL);

  async function run() {
    try {
      const db = client.db(DB_NAME);
      const users = db.collection(DB_USERS_COLLECTION);

      const cursor = await users.find();
      const result = await cursor.toArray();

      res.status(STATUS_OK).json(result);
    } finally {
      await client.close();
    }
  }

  run().catch((ex) => {
    console.error("[SERVER] GET /users: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).end();
  });
});

/*
 * GET /:id service
 * Real route: GET /users/:id
 * Returns a specific user by their _id.
 */
router.get("/:id", function (req, res) {
  const client = new MongoClient(DB_URL);

  async function run() {
    try {
      const db = client.db(DB_NAME);
      const users = db.collection(DB_USERS_COLLECTION);

      const id = new ObjectId(req.params.id);
      const result = await users.findOne({ _id: id });

      if (result) {
        res.status(STATUS_OK).json(result);
      } else {
        res.status(STATUS_NOTFOUND).end();
      }
    } catch (error) {
      if (error instanceof Error && error.name === "BSONError") {
        console.error("[SERVER] ID format error: " + error);
        res.status(STATUS_BADFORMAT).json({
          message: "Invalid id format",
          error: error.message,
        });
      } else {
        console.error("[SERVER] GET /users/:id: " + error);
        res.status(STATUS_SERVER_ERROR).json({
          message: "Server error",
          error: error.message,
        });
      }
    } finally {
      await client.close();
    }
  }

  run().catch((ex) => {
    console.error("[SERVER] GET /users/:id: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).json({
      message: "Server error",
      error: ex.message,
    });
  });
});

/*
 * DELETE /:id service
 * Real route: DELETE /users/:id
 * Deletes a specific user by their _id.
 */
router.delete("/:id", function (req, res) {
  const client = new MongoClient(DB_URL);

  async function run() {
    try {
      const db = client.db(DB_NAME);
      const users = db.collection(DB_USERS_COLLECTION);

      const id = new ObjectId(req.params.id);
      const result = await users.deleteOne({ _id: id });

      if (result.acknowledged && result.deletedCount === 1) {
        console.log("[SERVER] User deleted successfully.");
        res.status(STATUS_OK).end();
      } else {
        res.status(STATUS_NOTFOUND).end();
      }
    } catch (error) {
      if (error instanceof Error && error.name === "BSONError") {
        console.error("[SERVER] ID format error: " + error);
        res.status(STATUS_BADFORMAT).json({
          message: "Invalid id format",
          error: error.message,
        });
      } else {
        console.error("[SERVER] DELETE /users/:id: " + error);
        res.status(STATUS_SERVER_ERROR).json({
          message: "Server error",
          error: error.message,
        });
      }
    } finally {
      await client.close();
    }
  }

  run().catch((ex) => {
    console.error("[SERVER] DELETE /users/:id: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).json({
      message: "Server error",
      error: ex.message,
    });
  });
});

/*
 * PUT /:id service
 * Real route: PUT /users/:id
 * Updates an existing user.
 * Does not allow modification of 'user' or '_id'.
 */
router.put("/:id", function (req, res) {
  const client = new MongoClient(DB_URL);

  async function run() {
    try {
      const db = client.db(DB_NAME);
      const users = db.collection(DB_USERS_COLLECTION);

      const id = new ObjectId(req.params.id);

      if (
        req.body === undefined ||
        req.body.user !== undefined ||
        req.body._id !== undefined
      ) {
        console.log("[SERVER] The 'user' or '_id' field cannot be modified.");
        res.status(STATUS_BADFORMAT).json({
          message: "The 'user' or '_id' field cannot be modified."
        });
      } else {
        const result = await users.updateOne({ _id: id }, { $set: req.body });

        if (result.matchedCount === 1) {
          console.log("[SERVER] User updated successfully.");
          res.status(STATUS_OK).end();
        } else {
          res.status(STATUS_NOTFOUND).end();
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "BSONError") {
        console.error("[SERVER] ID format error: " + error);
        res.status(STATUS_BADFORMAT).json({
          message: "Invalid id format",
          error: error.message,
        });
      } else {
        console.error("[SERVER] PUT /users/:id: " + error);
        res.status(STATUS_SERVER_ERROR).json({
          message: "Server error",
          error: error.message,
        });
      }
    } finally {
      await client.close();
    }
  }

  run().catch((ex) => {
    console.error("[SERVER] PUT /users/:id: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).json({
      message: "Server error",
      error: ex.message,
    });
  });
});

// Export the router to be able to import it from index.js.
module.exports = router;
