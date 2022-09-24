const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const RegistrationRequestSchema = new Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  domain: {
    ref: "Domain",
    type: mongoose.Schema.Types.ObjectId,
  },
  pack: {
    ref: "Pack",
    type: mongoose.Schema.Types.ObjectId,
  },
  status: {
    type: String,
    enum: ["virgin", "paid"],
    default: "virgin",
    required: true,
  },

  wilaya: {
    type: String,
    required: true,
  },
});
RegistrationRequestSchema.set("timestamps", true);

const RegistrationRequest = mongoose.model(
  "RegistrationRequest",
  RegistrationRequestSchema
);
module.exports = RegistrationRequest;
