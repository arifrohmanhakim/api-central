const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userMetaSchema = Schema(
  {
    u_id: { type: Schema.Types.ObjectId, required: true, ref: "user" },
    um_key: { type: String, required: true },
    um_value: String,
  },
  {
    versionKey: false,
  }
).index({ u_id: 1, um_key: 1 });

module.exports = mongoose.model("user_meta", userMetaSchema);
