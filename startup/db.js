const winston = require("winston");
const mongoose = require("mongoose");
const config = require("config");

module.exports = function () {
  const db = config.get("db");

  mongoose
    .connect(db)
    .then(db => {
      console.log("Database connected");
      //winston.info("connected to MongoDB..");   //AA:this gives error: [winston] Attempt to write logs with no transports %j {message: 'connected to MongoDB..', level: 'info', Symbol(level): 'info'}
    })
    .catch(error => console.log("Could not connect to mongo db " + error));
};
