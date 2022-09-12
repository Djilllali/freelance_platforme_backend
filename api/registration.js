// ===========imports=================================================
const express = require("express");
const RegistrationRequest = require("../models/registration_request");
const router = express.Router();

router.post("/register", async (req, res) => {
  let { first_name, last_name, email, phone, pack, domain, wilaya } = req.body;
  let newRegRequest = new RegistrationRequest({
    first_name,
    last_name,
    email,
    phone,
    pack,
    domain,
    wilaya,
  });

  let mRequest = await newRegRequest.save();
  if (mRequest) {
    return res
      .status(200)
      .json({ status: true, message: "registered successfully" });
  } else {
    return res
      .status(400)
      .json({ status: true, message: "registration failed" });
  }
});

module.exports = router;
