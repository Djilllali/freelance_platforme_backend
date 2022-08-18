const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PackSchema = new Schema({
  working_hours: { type: mongoose.Schema.Types.Number, required: true },
  name: { type: String, required: true },
  price: { type: mongoose.Schema.Types.Number, required: true },
});

const Pack = mongoose.model("Pack", PackSchema);
module.exports = Pack;
