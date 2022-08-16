// ===========imports=================================================
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const passport = require("passport");
const Job = require("../models/job");
const Joi = require("joi");
const { JWTSECRET } = require("../utils/constants");

router.post(
  "/createNewJob",
  passport.authenticate("admin-jwt", { session: false }),
  async (req, res) => {
    const {
      owner,
      description,
      deadline,
      initial_price,
      client_price,
      estimated_time,
    } = req.body;
    console.log(req.body);
    const creator  = req.user._id;
   

    if (
      !owner ||
      !description ||
      !deadline ||
      !initial_price ||
      !client_price ||
      !estimated_time
    ) {
      return res.json({
        status: "error",
        message: "some information are required !",
      });
    }
    let createJob = new Job({
      owner,
      description,
      deadline,
      initial_price,
      client_price,
      estimated_time,
      creator,
    });
    let createdJobResult = await createJob.save();
    if (!createdJobResult) {
      return res
        .status(400)
        .json({ status: "false", message: "Error creating job" });
    } else {
      res.json({ status: "true", message: "job created successfully" });
    }
  }
);
module.exports = router;
