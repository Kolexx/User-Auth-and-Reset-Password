const router = require("express").Router();
const { User } = require("../models/user");
const Token = require("../models/token");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const bcrypt = require("bcrypt");
const { message } = require("statuses");

router.post("/", async (req, res) => {
  try {
    const emailSchema = Joi.object({
      email: Joi.string().email().required().label("Email"),
    });
    const { error } = emailSchema.validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });
    let user = await User.findOne({ email: req.body.email });
    if (!user)
      return res
        .status(409)
        .send({ message: "User with given email does not exist" });
    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }

    const url = `${process.env.BASE_URL}/api/password-reset/${user._id}/${token.token}`;
    await sendEmail(user.email, "Password Reset", url);

    return res
      .status(200)
      .send({ message: "Password reset link sent to your email account" });
  } catch (error) {
    return res.status(500).send({ message: "Internal serval error" });
  }
});

//reset password
router.put("/:id/:token", async (req, res) => {
  try {
    if (!req.params.id || !req.params.token) {
      return res.status(412).send({ message: "id or token is required" });
    }
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "invalid link" });

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send({ message: "invalid link" });

    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).send({ message: "password mismatch" });
    }
    const passwordSchema = Joi.object({
      password: passwordComplexity().required().label("password"),
      confirmPassword: passwordComplexity()
        .required()
        .label("Confirm password"),
    });
    const { error } = passwordSchema.validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    await User.findOneAndUpdate(
      { _id: req.params.id },
      { password: hashPassword }
    );
    await Token.findOneAndDelete({
      userId: user._id,
      token: req.params.token,
    });
    res.status(200).send({ message: "password reset successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal serval error" });
  }
});
module.exports = router;
