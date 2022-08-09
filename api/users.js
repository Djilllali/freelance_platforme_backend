// ===========imports=================================================
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const path = require("path");
const jwt = require("jsonwebtoken");

// const VerificationDocument = require("../models/verificationDocument");

const passport = require("passport");
const Joi = require("joi");
const { JWTSECRET } = require("../utils/constants");
// ============== Register ==========================================
router.post("/register", async (req, res) => {
  console.log(req.body);
  const schema = Joi.object({
    password: Joi.string().min(6).max(30).required(),
    email: Joi.string()
      .required()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net", "fr", "dz"] },
      }),
    phone: Joi.string()
      .required()
      .min(9)
      .max(12)
      .pattern(/^[0-9]+$/),
    password2: Joi.ref("password"),
    name: Joi.string().required().min(3).max(20),
  });
  const options = {
    abortEarly: true, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  };
  const { error, value } = schema.validate(req.body, options);
  if (error) {
    return res
      .status(400)
      .json({ status: "false", message: error.details[0].message });
  } else {
    req.body = value;
  }
  let { email, password, phone, name } = req.body;

  let userWithSameEmail = await User.findOne({ email: email });
  if (userWithSameEmail) {
    return res
      .status(400)
      .json({ status: "false", message: "Email already used by another user" });
  }
  let userWithSamePhone = await User.findOne({ phone: phone });
  if (userWithSamePhone) {
    return res
      .status(400)
      .json({ status: "false", message: "Phone already used by another user" });
  }

  let createdUser = new User({
    phone,
    email,
    password,
    name,
  });
  let createdUserResult = await createdUser.save();
  if (!createdUserResult) {
    return res
      .status(400)
      .json({ status: "false", message: "Error creating user" });
  } else {
    res.json({ status: "true", message: "registered successfully" });
  }
});

// **************** End Register *******************************

// =================Signin ========================================
router.post("/login", async (req, res, next) => {
  const schema = Joi.object({
    password: Joi.string().min(6).max(30).required(),
    email: Joi.string()
      .required()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net", "fr", "dz"] },
      }),
  });
  const options = {
    abortEarly: true, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  };
  const { error, value } = schema.validate(req.body, options);
  if (error) {
    return res
      .status(400)
      .json({ status: "false", message: error.details[0].message });
  } else {
    req.body = value;
  }
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({ status: "false", message: "Not registered" });
  }
  user.comparePassword(req.body.password, async (error, isMatch) => {
    if (error) {
      return res
        .status(400)
        .json({ status: "false", message: "An Error accured , cannot login" });
    } else {
      if (!isMatch) {
        return res
          .status(400)
          .json({ status: "false", message: "Wrong Password" });
      }
      let ObjectToSign = { iss: "qcmgeek", sub: user._id };

      let signedJWT = jwt.sign(ObjectToSign, JWTSECRET);
      return res.json({
        status: "true",
        message: "Success login",
        data: { token: signedJWT },
      });
    }
  });
});
// ************ End Signin ********

// ===============================================================================

// ================== check user ===========================

router.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    return res.send("protected by user auth");
  }
);
// ===========================================================

// ================== get Profile ===========================
router.get(
  "/get_profile",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user) {
      let mUser = await User.findById(
        req.user._id,
        "name phone email licenses"
      );
      if (!mUser) {
        return res
          .status(400)
          .json({ status: "false", message: " Error ! could not get user" });
      }
      return res.json({
        status: "true",
        message: "profile fetched successfully",
        data: mUser,
      });
    }
  }
);

module.exports = router;
