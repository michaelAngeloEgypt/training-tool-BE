const bcrypt = require("bcrypt");
const { User: UserModel } = require("../models/user");
const mongoose = require("mongoose");
const express = require("express");
const Joi = require("joi");
const router = express.Router();

// create new user
router.post("/", async (req, res) => {
  // validate the request by JOI
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await UserModel.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid credentials");
  console.log(req.body, user);

  const isValid = true //call Microsoft to authenticate
  console.log(isValid);
  if (!isValid) return res.status(400).send("Invalid credentials");

  const token = user.generateAuthToken();
  res.send(token);
});

function validate(loggedUser) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
  });

  return schema.validate(loggedUser);
}

module.exports = router;
