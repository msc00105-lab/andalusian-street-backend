const VERSION = "1.0"; // Variable to indicate the service version

// SERVICE_NAME stores the service name that appears when starting the server
const SERVICE_NAME = "Andalusian Street - Garment management service"; // Replace with each team's service name

// SERVICE_PORT indicates the port on which the HTTP server will listen
const SERVICE_PORT = 8081; // Port for the HTTP service

// Definition of status codes used by the application
// Defined as constants to avoid having raw numbers throughout the code
const STATUS_OK = 200;
const STATUS_CREATED = 201;
const STATUS_BADFORMAT = 400;
const STATUS_NOTFOUND = 404;
const STATUS_UNAUTHORIZED = 401;
const STATUS_FORBIDDEN = 403;
const STATUS_SERVER_ERROR = 500;

// MongoDB database constants
// DB_URL is the address of the local MongoDB server
const DB_URL = "mongodb://localhost:27017/";

// DB_NAME is the name of the database used by the project
const DB_NAME = "ssaatt";

// Name of the collection where users are stored
const DB_USERS_COLLECTION = "users";

// Name of the collection where garments are stored
const DB_PRENDAS_COLLECTION = "prendas";

// Definition bases
// Base object to validate that a garment has all necessary fields
const PRENDA_BASE = {
  nombre: "",
  tipo: "",
  material: ""
};

// Base object to validate that a user has all necessary fields
const USER_BASE = {
  user: "",
  password: "",
  name: "",
  surname: "",
  email: ""
};

const API = {
  LOGIN: "/login",
  USERS: "/users",
  PRENDAS: "/prendas"
};

/* Node.js modules for deploying the server */
// os allows obtaining system and host information
const os = require("node:os"); // Module for operating system and host information

// dns allows resolving the host name to an IP
const dns = require("node:dns"); // Module to use the DNS service

const path = require("node:path");

// Express is used to create the server and define routes/endpoints
const express = require("express"); // Import Express package

// MongoClient allows connecting to MongoDB
// ObjectId allows handling MongoDB's own _id identifiers
const { MongoClient, ObjectId } = require("mongodb");
const loginRouter = require("./routes/login");
const usersRouter = require("./routes/users");
const prendasRouter = require("./routes/prendas");

// The main Express application is created
const app = new express(); // Creation of the Express application
app.use(express.static(path.join(__dirname, "/public")));


// Middleware to automatically interpret JSON bodies of requests
app.use(express.json()); // To process application/json data types.
// This allows the Request (req) object to use the req.body property to
// access each property of the request body by its name.


// First endpoint - Generic entry point to the server to log incoming requests
// This middleware runs before the rest and prints the method and path of each request to the console
app.use((req, res, next) => {
  console.log("[SERVER] Incoming request:" + req.method + " " + req.path);
  next(); // Passes the process to the next matching endpoint
});

app.use(API.LOGIN, loginRouter);
app.use(API.USERS, usersRouter);
app.use(API.PRENDAS, prendasRouter);


// Default last endpoint in case the request is not in the REST API - Error 404
// This endpoint runs only if no previous route matches the request
app.use((req, res) => {
  res.status(STATUS_NOTFOUND).end();
});

// Initial server startup message
console.log(`[SERVER] Starting HTTP server on Node.js 
           Service ${SERVICE_NAME}
           Version ${VERSION}           
-------------------------------------------------`);

// This code uses the dns and os modules to look up the host IP
// It first resolves the device IP and then starts Express, listening on that IP and the defined port
dns.lookup(os.hostname(), 4, function (err, address, family) {
  // 4 for IPv4
  if (err) {
    console.error("[SERVER] Error obtaining server IP.");
  } else {
    console.log("[SERVER] Server IP: " + address.toString());
    // The HTTP server is started once the IP has been found on the fixed port
    app.listen(SERVICE_PORT, address.toString(), (error) => {
      if (error) {
        console.error(`[SERVER] Error initializing: ${error}`);
      } else {
        console.log(
          `[SERVER] Server running at http://${address}:${SERVICE_PORT}`,
        );
      }
    });
  }
});
