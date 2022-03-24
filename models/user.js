const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
    trim: true,
  },
  password: {
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
    fullName: Joi.string().required().label("FullName"),
    email: Joi.string().email().required().label("Email"),
    phoneNumber: Joi.number().required().label("Number"),
    password: passwordComplexity().required().label("Password"),
    dateOfBirth: Joi.date().raw().required(),
    gender: Joi.string().required().label("gender"),
  });
  return schema.validate(data);
};

module.exports = { User, validate };
