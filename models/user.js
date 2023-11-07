const jwt = require("jsonwebtoken");
const config = require("config");
const Joi = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  status: {
    type: String,
    required: false,
    minlength: 4,
    maxlength: 50,
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId, ref: "department",
    required: false
  },
  roleInDepartment: {
    type: String,
    required: false,
    minlength: 4,
    maxlength: 50,
  },
  role: {
    type: String,
    required: false,
    minlength: 4,
    maxlength: 15,
  },
});


const User = new mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    status: Joi.string().min(4).max(50),
    departmentId: Joi.string(),
    departmentName: Joi.string().min(5).max(50),   //only for bulk add users
    roleInDepartment: Joi.string().min(4).max(50),
    role: Joi.string().min(4).max(15)
  });

  return schema.validate(user);
}

function generateAuthToken() {
  const token = jwt.sign({ email: this.email }, config.get("jwtPrivateKey"));
  return token;
};

exports.User = User;
exports.validate = validateUser;
exports.generateAuthToken = generateAuthToken;
