const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
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
    required: true,
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
