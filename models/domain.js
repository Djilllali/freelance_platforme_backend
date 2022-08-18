const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DomainSchema = new Schema({
  name: { type: String, required: true },
  subdomains: { type: [String], required: true, default: [] },
});

const Domain = mongoose.model("Domain", DomainSchema);
module.exports = Domain;
