// ===========imports=================================================
const express = require("express");
const router = express.Router();
const Domain = require("../models/domain");

router.get("/get", async (req, res) => {
  let mDomains = await Domain.find({});
  res.status(200).json({ status: true, data: mDomains });
});

module.exports = router;
