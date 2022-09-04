// ===========imports=================================================
const express = require("express");
const router = express.Router();
const Pack = require("../models/pack");

router.post("/get", async (req, res) => {
  let mPacks = await Pack.find({});
  res.status(200).json({ status: true, data: mPacks });
});

module.exports = router;
