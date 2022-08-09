var express = require("express");
var router = express.Router();

var path = require("path");
router.get("/*", function (req, res, next) {
  if (req.subdomains.length === 1 && req.subdomains[0] === "panel")
    return res.sendFile(path.resolve("public", "panel", "index.html"));
  else res.sendFile(path.resolve("statics", "home.html"));
});

module.exports = router;
