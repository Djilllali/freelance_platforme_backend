// =======================imports=======================================================
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const port = require("./utils/constants");
const { MONGO_URI } = require("./utils/database");
const session = require("express-session");
const passport = require("passport");
const { PORT, SECRET_KEY, ACCESS_KEY } = require("./utils/constants");
const cors = require("cors");
var path = require("path");
const indexRouter = require("./router");
const server = express();
require("./controllers/passport");
const helmet = require("helmet");
const { downloadFile } = require("./controllers/upload");

// =====================  MiidleWares===================================================
server.use(helmet());
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
// =========Passport Auth=======

server.use(
  session({
    secret: "MARLBORO123TOTHEMOON",
    resave: true,
    saveUninitialized: true,
  })
);
server.use(cors({origin : "*"}));
server.use(passport.initialize());
server.use(passport.session());

// ================== Routes ===========================================================

server.use("/users", require("./api/users"));
server.use("/admins", require("./api/admins"));
server.use("/jobs", require("./api/jobs"));
server.use("/s3", require("./api/uploadFile"));
server.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
server.get("/files/:key", (req, res) => {
  console.log(req.params);
  const key = req.params.key;
  const readStream = downloadFile(key);

  readStream.pipe(res);
});
server.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/auth/google/success",
    failureRedirect: "/auth/google/failure",
  })
);

// ================== Launch Server =======================================================
server.use(express.static(path.join(__dirname, "public")));
server.use("/", indexRouter);

server.listen(PORT, () => {
  console.log(`====server started on port: ${PORT}`);
});

// ================== Connect Mongo Database ===============================================

function connectDatabase() {
  mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log("******** database connected !! *********");
    })
    .catch((err) => {
      console.log(err);
      console.log("reconnecting in 3 seconds  ...");
      setTimeout(() => {
        connectDatabase();
      }, 3000);
    });
}
connectDatabase();
