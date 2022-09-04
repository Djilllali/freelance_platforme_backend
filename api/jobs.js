// ===========imports=================================================
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const passport = require("passport");
const Job = require("../models/job");
const Withdrawal_req = require("../models/withdrawal_request");
const Joi = require("joi");
const { JWTSECRET } = require("../utils/constants");
const User = require("../models/user");

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
    const creator = req.user._id;

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

router.post(
  "/getAllJobs",
  passport.authenticate("admin-jwt", { session: false }),
  async (req, res) => {
    let allJobs = await Job.find({});
    if (allJobs) return res.json({ allJobs });
    else res.json({ status: "false", message: "Error getting all jobs" });
  }
);

router.post(
  "/getAssignedJobs",
  passport.authenticate("admin-jwt", { session: false }),
  async (req, res) => {
    if (req.body.status) {
      let assignedJobs = await Job.find({
        assignedTo: req.user._id,
        status: req.body.status,
      });

      if (assignedJobs) return res.json({ assignedJobs });
      else
        res.json({ status: "false", message: "Error getting assigned jobs" });
    } else {
      let assignedJobs = await Job.find({
        assignedTo: req.user._id,
      });

      if (assignedJobs) return res.json({ assignedJobs });
      else
        res.json({ status: "false", message: "Error getting assigned jobs" });
    }
  }
);

router.post(
  "/getOneJob",
  passport.authenticate("admin-jwt", { session: false }),
  async (req, res) => {
    const _id = req.body._id;
    let oneJob = await Job.findOne({ _id: req.body._id });
    if (oneJob) return res.json({ oneJob });
    else res.json({ status: "false", message: "Error finding this job" });
  }
);

router.post(
  "/explore",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { filters } = req.body;

    let mUSer = await User.findById(req.user._id);
    if (!mUSer) return res.status(403);
    let query = {};
    if (!filters?.domain) {
      query.domain = mUSer.domain?.toString();
    } else {
      query.domain = filters.domain;
    }
    if (!filters?.keyword) {
      query.keyword = "";
    } else {
      query.keyword = filters.keyword;
    }
    if (!filters?.skills || filters?.skills?.length < 1) {
      query.skills = null;
    } else {
      query.skills = filters.skills;
    }
    console.log("--------explore jobs query", query);
    let jobs = await Job.find({
      $and: [
        { $or: [{ assignedTo: { $exists: false } }, { assignedTo: null }] },
        { domain: query.domain },
        {
          $or: [
            { description: { $regex: query.keyword } },
            { title: { $regex: query.keyword } },
          ],
        },
        { skills: query.skills ? { $in: query.skills } : { $exists: true } },
        { status: "virgin" },
      ],
    });
    if (jobs) return res.json({ jobs });
    else res.json({ status: "false", message: "Error finding this job" });
  }
);
router.post(
  "/myjobs",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let jobs = await Job.find(
      {
        assignedTo: req.user._id,
      },
      "title description domain estimated_time client_price skills status"
    );
    if (jobs) return res.json({ jobs });
    else res.json({ status: "false", message: "Error finding this job" });
  }
);

router.post(
  "/updateJobStatus",
  passport.authenticate("admin-jwt", { session: false }),
  async (req, res) => {
    const _id = req.body._id;

    let updated = await Job.findOneAndUpdate(
      { _id: req.body._id },
      { assignedTo: req.body.user_id, status: req.body.status }
    );

    if (!updated) {
      return res
        .status(400)
        .json({ status: "false", message: "Error updating job" });
    } else {
      res.json({ status: "true", message: "job updated sexfully" });
    }
  }
);
router.post(
  "/takeJob",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const _id = req.body._id;

    let updated = await Job.findOneAndUpdate(
      { _id: req.body._id, status: "virgin" },
      { assignedTo: req.user._id, status: "inprogress" }
    );

    if (!updated) {
      return res
        .status(400)
        .json({ status: "false", message: "Error updating job" });
    } else {
      res.json({ status: "true", message: "job updated successfully" });
    }
  }
);
router.post(
  "/withdrawal_request",
  passport.authenticate("admin-jwt", { session: false }),
  async (req, res) => {
    const { job_id, user_id, payment_method } = req.body;

    let mJob = await Withdrawal_req.findOne({ job_id });
    if (mJob) {
      return res
        .status(400)
        .json({ status: "false", message: "withdrawal already exists" });
    }
    let Withdrawal = new Withdrawal_req({
      job_id,
      user_id,
      payment_method,
    });
    let withdrawalResult = await Withdrawal.save();
    if (!withdrawalResult) {
      return res
        .status(400)
        .json({ status: "false", message: "Error creating withdrawal" });
    } else {
      res.json({ status: "true", message: "withdrawal created successfully" });
    }
  }
);
router.post(
  "/create_withdrawal_request",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { job_id, payment_method } = req.body;
    const user_id = req.user._id;
    console.log("************************** ", req.body);
    let mJob = await Job.findOne({ _id: job_id });

    if (mJob) {
      if (mJob.status !== "approved") {
        return res
          .status(400)
          .json({ status: "false", message: "job  is not  approved yet" });
      }
    } else {
      return res
        .status(400)
        .json({ status: "false", message: "job  does not  exist" });
    }
    let Withdrawal = new Withdrawal_req({
      job_id,
      user_id,
      payment_method,
    });
    let withdrawalResult = await Withdrawal.save();
    if (!withdrawalResult) {
      return res
        .status(400)
        .json({ status: "false", message: "Error creating withdrawal" });
    } else {
      res.json({ status: "true", message: "withdrawal created successfully" });
    }
  }
);
router.post(
  "/withdrawal_requests",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let mWithdrawalRequests = await Withdrawal_req.find({
      user_id: req.user._id,
    });
    if (mWithdrawalRequests) {
      return res.json({ data: mWithdrawalRequests });
    } else {
      return res
        .status(400)
        .json({ message: "Could not get withdrawal requests" });
    }
  }
);
router.post(
  "/cancel_withdrawal_request/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    console.log("------------- withdrawal id ", req.params.id);
    let mWithdrawalRequest = await Withdrawal_req.findOne({
      _id: req.params.id,
    });

    if (!mWithdrawalRequest)
      return res.status(400).json({
        status: "false",
        message: "withdrawal request does not exist",
      });

    if (mWithdrawalRequest.status !== "verifiying") {
      return res.status(400).json({
        status: "false",
        message: "could not cancel withdrawal request that is already verified",
      });
    }
    let deleteWithdrawalRequestResult = await Withdrawal_req.deleteOne({
      _id: req.params.id,
    });
    if (!deleteWithdrawalRequestResult) {
      return res.status(400).json({
        status: "false",
        message: "could not cancel withdrawal request",
      });
    } else {
      return res.json({ status: true, message: "deleted successfully " });
    }
  }
);
router.post(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let oneJob = await Job.findOne(
      { _id: req.params.id },
      "title description assignedTo domain estimated_time client_price skills status submission"
    );
    if (oneJob) {
      console.log(
        "-----^^^^^^^^^^^^^assigned to ",
        oneJob.assignedTo?.toString()
      );
      console.log("-----^^^^^^^^^^^^^user  id ", req.user.id);
      console.log(
        "-----^^^^^^^^^^^^^ is equal  ",
        req.user.id == oneJob.assignedTo?.toString()
      );
      console.log(
        "-----^^^^^^^^^^^^^ is STRICT equal  ",
        req.user.id === oneJob.assignedTo?.toString()
      );
      if (oneJob.assignedTo?.toString() !== req.user.id) {
        console.log("ùùùùùùùù%%%%%%%%% deleting ");
        oneJob.submission = undefined;
        oneJob.assignedTo = undefined;
      }
      console.log("-------------------- getjob onejob res ", oneJob);
      return res.json({ job: oneJob });
    } else res.json({ status: "false", message: "Error finding this job" });
  }
);
module.exports = router;
