const winston = require("winston");
require("winston-mongodb");
require("express-async-errors");
module.exports = function () {
  winston.exceptions.handle(
    //AA:I need to add this log file to VisualStudio code but ignore it in git
    new winston.transports.File({ filename: "uncaughtExceptions.log" })
  );

  process.on("unhandledRejection", (ex) => {
    throw ex;
  });

  const transports = {
    console: new winston.transports.Console({ level: "info" }),
    file: new winston.transports.File({
      filename: "logfile.log",
      level: "info",
    }),
  };

  const logger = winston.createLogger({
    transports: [transports.console, transports.file],
  });

  winston.add(winston.transports.File, { filename: "logfile.log" });

  //AA:I need to see winston output in my db
  winston.add(winston.transports.MongoDB, {
    db: "mongodb://127.0.0.1/ta-log",
    level: "info",
  });
};
