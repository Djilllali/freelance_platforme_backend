const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
//----
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },
  personal_email: {
    type: String,
    required: false,
  },
  ccp: {
    type: String,
    required: false,
  },
  verified: {
    type: Boolean,
    required: true,
    default: false,
  },
  password: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: false,
  },
  bio: {
    type: String,
    required: false,
    default: "",
  },
  googleId: {
    type: String,
    required: false,
  },
  domain: {
    ref: "Domain",
    type: mongoose.Schema.Types.ObjectId,
  },
  pack: {
    ref: "Pack",
    type: mongoose.Schema.Types.ObjectId,
  },
});
UserSchema.methods.comparePassword = async function (
  enteredPassword,
  callback
) {
  await bcrypt.compare(
    enteredPassword,
    this.password,
    function (error, isMatch) {
      if (error) return callback(error);
      callback(null, isMatch);
    }
  );
};
UserSchema.pre("save", async function (next) {
  if (this.isNew) {
    const user = this;

    const hash = await bcrypt.hash(user.password, 10);
    this.password = hash;
  }
  next();
});
UserSchema.set("timestamps", true);
const User = mongoose.model("User", UserSchema);
module.exports = User;
