const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DomainSchema = new Schema({
  name: { type: String, required: true },
  subdomains: [{ _id: Schema.Types.ObjectId, name: String }],
});
DomainSchema.set("timestamps", true);

const Domain = mongoose.model("Domain", DomainSchema);
module.exports = Domain;
