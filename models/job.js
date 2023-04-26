const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const JobSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  description: {
    type: String,
    required: true,
  },
  estimated_time: {
    type: Number,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["virgin", "inprogress", "finished", "approved", "paid"],
    default: "virgin",
    required: true,
    index: true,
  },
  skills: [
    {
      type: String,
      required: true,
    },
  ],
  domain: {
    type: Schema.Types.ObjectId,
    ref: "domain",
    required: true,
  },
  thread: [
    {
      sender: {
        type: String,
        maxlength: 50,
        required: true,
        default: "",
      },
      message: {
        type: String,
        maxlength: 1000,
        required: true,
        default: "",
      },
      msgAt: {
        type: Date,
        required: true,
        default: Date.now(),
      },
    },
  ],
  initial_price: {
    type: Number,
    maxlength: 4,
    required: true,
  },
  client_price: {
    type: Number,
    maxlength: 4,
    required: true,
  },
});

const Job = mongoose.model("Job", JobSchema);
module.exports = Job;
