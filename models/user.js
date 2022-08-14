const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },

  email: {
    type: String,
    required: false,
  },
  verified: {
    type: Boolean,
    required: false,
    default: false,
  },
  password: {
    type: String,
    required: false,
  },

  phone: {
    type: String,
    required: false,
  },
  bio: {
    type: String,
    required: false,
  },
  googleId: {
    type: String,
    required: false,
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
const User = mongoose.model("User", UserSchema);
module.exports = User;
