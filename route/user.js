const router = require("express").Router();
const { User, validate } = require("../models/user");
const bcrypt = require("bcrypt");
const Token = require("../models/token");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }
    let existingUser = await User.findOne({ email: req.body.email });
    if (existingUser && !existingUser.verified) {
      return res.status(409).send({
        message: "Kindly check your email and click verification link",
      });
    }
    if (existingUser) {
      return res.status(409).send({ message: "Email exist. Kindly login" });
    }
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    const user = await new User({ ...req.body, password: hashPassword }).save();

    const token = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();
    const url = `${process.env.BASE_URL}/api/user/${user.id}/verify/${token.token}`;
    await sendEmail(user.email, "Verify Email", url);

    return res.status(201).send({ message: "An Email Sent to account" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
});
router.put("/:id/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(400).send({ message: "Invalid link" });
    }
    if (user.verified) {
      return res
        .status(400)
        .send({ message: "Email verified already. Kindly login" });
    }
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) {
      return res.status(400).send({ message: "Invalid link" });
    }
    await User.updateOne({
      _id: user._id,
      verified: true,
    });
    await token.remove();
    res.status(200).send({ message: "Email verified succesfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});
module.exports = router;
