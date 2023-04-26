// ===========imports=================================================
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const passport = require("passport");
const Admin = require("../models/admin");
const Joi = require("joi");
const { JWTSECRET } = require("../utils/constants");
const User = require("../models/user");
// ============== Register ==========================================

const checkisSuper = async (req, res, next) => {
  console.log("----------  req user ", req.user);
  let mAdmin = await Admin.find({ _id: req.user._id, super: true });
  if (req.user.super && mAdmin) {
    next();
  } else {
    return res.status(403).json({ message: "You Don't Have Permissions" });
  }
};

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
  let admin = await Admin.findOne({ email: req.body.email });
  if (!admin) {
    return res.status(400).json({ status: "false", message: "Not registered" });
  }
  admin.comparePassword(req.body.password, async (error, isMatch) => {
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
      let ObjectToSign = { iss: "qcmgeek", sub: admin._id };

      let signedJWT = jwt.sign(ObjectToSign, JWTSECRET);
      return res.json({
        status: "true",
        message: "Success login",
        data: { token: signedJWT },
      });
    }
  });
});

// ============== Register ==========================================
router.post(
  "/create_admin",
  passport.authenticate("admin-jwt", { session: false }),
  checkisSuper,
  async (req, res) => {
    console.log(req.body);
    const schema = Joi.object({
      password: Joi.string().min(6).max(30).required(),
      email: Joi.string()
        .required()
        .email({
          minDomainSegments: 2,
          tlds: { allow: ["com", "net", "fr", "dz"] },
        }),
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
    let { email, password, name } = req.body;

    let adminWithSameEmail = await Admin.findOne({ email: email });
    if (adminWithSameEmail) {
      return res.status(400).json({
        status: "false",
        message: "Email already used by another user",
      });
    }

    let createdAdmin = new Admin({
      email,
      password,
      name,
    });
    let createdAdminResult = await createdAdmin.save();
    if (!createdAdminResult) {
      return res
        .status(400)
        .json({ status: "false", message: "Error creating user" });
    } else {
      res.json({ status: "true", message: "registered successfully" });
    }
  }
);
//==========auth test
router.post(
  "/get_profile",
  passport.authenticate("admin-jwt", { session: false }),
  async (req, res) => {
    if (req.user) {
      let mAdmin = await Admin.findById(
        req.user._id,
        "name phone email licenses"
      );
      if (!mAdmin) {
        return res
          .status(400)
          .json({ status: "false", message: " Error ! could not get profile" });
      }
      return res.json({
        status: "true",
        message: "profile fetched successfully",
        data: mAdmin,
      });
    }
  }
);
router.get(
  "/get_admins",
  passport.authenticate("admin-jwt", { session: false }),
  async (req, res) => {
    if (req.user) {
      let mAdmin = await Admin.find({}, "name  email super");
      if (!mAdmin) {
        return res
          .status(400)
          .json({ status: "false", message: " Error ! could not get admins" });
      }
      return res.json({
        status: "true",
        message: "admins fetched successfully",
        data: mAdmin,
      });
    }
  }
);
router.post(
  "/delete_admin",
  passport.authenticate("admin-jwt", { session: false }),
  checkisSuper,
  async (req, res) => {
    if (req.user) {
      let { admin } = req.body;
      if (!admin || admin == req.user._id) {
        return res.status(400).json({ message: "Invalid Admin Id" });
      }
      Admin.findOneAndDelete({ _id: admin }, (err) => {
        if (err) {
          return res.status(400).json({
            status: "false",
            message: " Error ! could not delete admins",
          });
        }
        return res.json({
          status: "true",
          message: "admin deleted successfully",
        });
      });
    }
  }
);
router.post(
  "/get_users",
  passport.authenticate("admin-jwt", { session: false }),
  async (req, res) => {
    let mUsers = await User.find({}, "name email phone licenses verified");
    if (!mUsers) {
      return res
        .status(400)
        .json({ status: "false", message: " Error ! could not get users" });
    }
    return res.json({
      status: "true",
      message: "users fetched successfully",
      data: mUsers,
    });
  }
);

router.post(
  "/protected",
  passport.authenticate("admin-jwt", { session: false }),
  (req, res) => {
    return res.send("protected by admin auth");
  }
);

module.exports = router;
