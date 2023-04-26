const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },
  super: {
    type: Boolean,
    default: false,
  },
});
AdminSchema.methods.comparePassword = async function (
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
AdminSchema.pre("save", async function (next) {
  if (this.isNew) {
    const user = this;

    const hash = await bcrypt.hash(user.password, 10);
    this.password = hash;
  }
  next();
});
AdminSchema.set("timestamps", true);

const Admin = mongoose.model("Admin", AdminSchema);
module.exports = Admin;
