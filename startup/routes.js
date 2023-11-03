const express = require("express");
// Define routes
const users = require("../routes/users");
const departments = require("../routes/departments");
const trainingrequests = require("../routes/trainingrequests");
const cancellationrequests = require("../routes/cancellationrequests");
const auth = require("../routes/auth");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/users", users);
  app.use("/api/departments", departments);
  app.use("/api/trainingrequests", trainingrequests);
  app.use("/api/cancellationrequests", cancellationrequests);
  app.use("/api/auth", auth);
};
