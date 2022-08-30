const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const moment = require("moment");
const Schema = mongoose.Schema;

const WithdrawalSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  job_id: {
    type: String,
    ref: "Job",
    required: true,
  },
  date: {
    type: Date,
    default: moment().add(3, "days"),
    required: true,
  },
  status: {
    type: String,
    enum: ["verifiying", "approved", "paid", "dispute"],
    default: "verifiying",
    required: true,
    index: true,
  },
  payment_method: {
    type: String,
    enum: ["cash", "ccp", "visa"],
    default: "verifiying",
    required: true,
    index: true,
  },
});

const Withdrawal = mongoose.model("Withdrawal", WithdrawalSchema);
module.exports = Withdrawal;
