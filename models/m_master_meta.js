const mongoose = require("mongoose");
const moment = require("moment");
const Schema = mongoose.Schema;

const masterMetaSchema = Schema(
  {
    mm_key: String,
    mm_value: String,
    m_id: { type: Schema.Types.ObjectId, required: true, ref: "master" },
  },
  {
    versionKey: false,
  }
).index({
  mm_key: 1,
  mm_value: 1,
  m_id: 1,
});

module.exports = mongoose.model("master_meta", masterMetaSchema);
