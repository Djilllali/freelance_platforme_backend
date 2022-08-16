// ===========imports=================================================
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const mailController = require("../controllers/mailer");
const bcrypt = require("bcrypt");
// const VerificationDocument = require("../models/verificationDocument");
const ResetPasswordRequest = require("../models/password_reset_request");
const { collection, addDoc } = require("firebase/firestore");
const { db } = require("../controllers/firebase");

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
router.post("/sendMail", async (req, res) => {
  mailController.sendMail(
    "Turing LTD",
    "zr.djillali@gmail.com",
    "Confirmation email",
    "This is your code "
  );

  res.send("sent succesfully");
});
router.post(
  "/edit_profile",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const schema = Joi.object({
      bio: Joi.string().min(6).max(100),
      name: Joi.string().min(3).max(20),
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
    if (req.user) {
      User.findOneAndUpdate(
        { _id: req.user._id },
        { ...req.body },
        (error, doc) => {
          if (error) {
            return res.status(400).json({
              status: "false",
              message: " Error ! could not update profile",
            });
          }
          return res.json({
            status: "true",
            message: "profile updated successfully",
          });
        }
      );
    }
  }
);
router.post(
  "/update_password",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    let oldpass = req.body.oldpass;
    let newpass = req.body.newpass;
    let newpass1 = req.body.newpass1;
    const schema = Joi.object({
      oldpass: Joi.string().min(6).max(30).required(),
      newpass1: Joi.string().min(6).max(30).required(),
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
    if (newpass !== newpass1)
      return res.status(400).json({ error: "Passwords are not identical" });
    let user = await User.findOne({ _id: req.user._id });
    console.log(oldpass, newpass, newpass1, _id);
    user.comparePassword(oldpass, async (error, isMatch) => {
      if (error) {
        return res.status(400).json({
          status: "false",
          message: "password doesn't match",
        });
      } else {
        if (!isMatch) {
          return res
            .status(400)
            .json({ status: "false", message: "Wrong Password" });
        }
      }
    });
    const hash1 = await bcrypt.hash(newpass1, 10);
    let updatePassword = await User.updateOne(
      { _id: req.user._id },
      { password: hash1 }
    );
    if (!updatePassword)
      return res.status(400).json({ error: "reset password error " });
  })
// router.post("/reset_password_email", (req, res) => {
//   let { email } = req.body;
//   let resetPasswordByEmail = async (user_id, email) => {
//     let mRandomCode = randomAsciiString(30);

//     let mResetPassReq = new ResetPasswordRequest({
//       user_id,
//       code: mRandomCode,
//       used: false,
//     });

//     let saveRequestResult = await mResetPassReq.save();

//     if (!saveRequestResult) return false;

//     let MailGenerator = new Mailgen({
//       theme: "salted",
//       product: {
//         name: "Techsiocc-noreplay",
//         link: "https://techsiocc.com/",
//         // Custom copyright notice
//         copyright: "Copyright © 2020 Techsiocc. All rights reserved.",
//       },
//     });

//     mailController.sendMail(
//       "Turing LTD",
//       "noreply@turingjobsdz.com",
//       "Reset password",
//       `Click the link below to reset your password <br><br> \n\n
//       https://techsiocc.com/resetpasswordemail/${mRandomCode}
//        `
//     );
//   };
// });
router.post("/sendSMS", async (req, res) => {
  let { message, to } = req.body;
  let confirmationCode = Number(Math.random() * 999999).toFixed(0);
  try {
    const docRef = await addDoc(collection(db, "messages"), {
      to: "+213776223271",
      body: `your verification code is  :  ${confirmationCode} `,
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
});

module.exports=router;