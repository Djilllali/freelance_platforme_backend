const express = require("express");
const router = express.Router();
const UploadController = require("../controllers/upload"),
  AdminPath = "public/generalAssets";

const multer = require("multer"),
  path = require("path"),
  fs = require("fs");

function mkdirpath(dirPath) {
  try {
    fs.accessSync(dirPath, fs.constants.R_OK | fs.constants.W_OK);
    console.log("error1");
  } catch (err) {
    try {
      fs.mkdirSync(dirPath);
      console.log("error2");
    } catch (e) {
      console.log("error3");
      mkdirpath(path.dirname(dirPath));
      mkdirpath(dirPath);
    }
  }
}
/** ********************************************************************************************************************************************** **/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    mkdirpath(AdminPath);
    cb(null, AdminPath);
    console.log("error4");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,

  fileFilter: (req, file, cb) => {
    console.log("error5");
    if (file.mimetype === "application/zip") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(
        req.res.status(400).json({ error: "only zip files are allowed!" })
      );
    }
  },
});

router.post(
  "/upload",
  upload.single("upload"),
  UploadController.Generalupload
);

module.exports = router;
