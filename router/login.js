const express = require("express");
const { MongoClient } = require("mongodb");
const router = express.Router();

const STATUS_OK = 200;
const STATUS_BADFORMAT = 400;
const STATUS_UNAUTHORIZED = 401;
const STATUS_SERVER_ERROR = 500;

const DB_URL = "mongodb://localhost:27017/";
const DB_NAME = "ssaatt";
const DB_USERS_COLLECTION = "users";

/*
 * Authentication service POST / */
 router.post("/", (req, res) => {
  // If no JSON body arrives, the request format is invalid.
  if (req.body === undefined) {
    res.status(STATUS_BADFORMAT).end();
    return;
  }

  // If user or password are missing, it is also considered an incorrect format.
  if (req.body.user === undefined || req.body.password === undefined) {
    res.status(STATUS_BADFORMAT).end();
    return;
  }

  // The received body is shown in the console to facilitate debugging.
  console.dir(req.body);

  // We create a MongoDB client to connect to the database.
  const client = new MongoClient(DB_URL);

  // Asynchronous function to query MongoDB using await.
  async function run() {
    try {
      // We select the database.
      const db = client.db(DB_NAME);

      // We select the users collection.
      const users = db.collection(DB_USERS_COLLECTION);

      // We look for a user whose username and password match.
      const result = await users.findOne({
        user: req.body.user,
        password: req.body.password
      });

      // If MongoDB returns a document, the authentication is successful.
      if (result) {
        res.status(STATUS_OK).json({
          message: "Authentication successful",
          _id: result._id,
          user: result.user
        });
      } else {
        // If there is no match, the credentials are incorrect.
        res.status(STATUS_UNAUTHORIZED).end();
      }
    } finally {
      // We always close the connection to MongoDB.
      await client.close();
    }
  }

  // If an internal error occurs, we respond with 500.
  run().catch((ex) => {
    console.error("[SERVER] POST /login: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).end();
  });
});

// We export the router to be able to use it from index.js.
module.exports = router;
