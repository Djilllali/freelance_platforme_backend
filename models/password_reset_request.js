const mongoose = require("mongoose");
const Schema = mongoose.Schema;

resetPasswordByEmailSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    code: { type: String, required: true, index: true },
    used: { type: Boolean, required: true, index: true },
  },
  { timestamps: true }
);

const ResetPasswordByEmail = mongoose.model(
  "resetpasswordrequest",
  resetPasswordByEmailSchema
);

module.exports = ResetPasswordByEmail;
