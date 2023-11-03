const winston = require("winston");
// Joi validation
const Joi = require("joi");
// Joi.objectId = require("joi-objectid")(Joi);

// Define express
const express = require("express");
const app = express();

const config = require("config");

require("./startup/logging");
require("./startup/cors")(app);
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();

const port = process.env.PORT || config.get("port");
const server = app.listen(port, () => {
  //winston.info(`listening on port ${port}...`);
  console.log(`listening on port ${port}...`);
});

module.exports = server;
