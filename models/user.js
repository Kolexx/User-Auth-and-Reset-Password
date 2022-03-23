const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema({
  Fullname: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  PhoneNumber: {
    type: Number,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
    trim: true,
  },
  Password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});
userSchema.methods.generateAuthToken = () => {
  const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
    expiresIn: "7d",
  });
  return token;
};

const User = mongoose.model("user", userSchema);
const validate = (data) => {
  const schema = Joi.object({
    Fullname: Joi.string().required().label("FullName"),
    Email: Joi.string().email().required().label("Email"),
    PhoneNumber: Joi.number().required().label("Number"),
    Password: passwordComplexity().required().label("Password"),
    dateOfBirth: Joi.date().raw().required(),
    gender: Joi.string().required().label("gender"),
  });
  return schema.validate(data);
};

module.exports = { User, validate };
