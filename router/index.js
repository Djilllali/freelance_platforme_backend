var express = require("express");
var router = express.Router();

var path = require("path");
router.get("/*", function (req, res, next) {
  if (!(req.subdomains.length === 1 && req.subdomains[0] === "panel"))
    res.sendFile(path.resolve("public", "home.html"));
  else return res.sendFile(path.resolve("public", "panel", "index.html"));
});

module.exports = router;
