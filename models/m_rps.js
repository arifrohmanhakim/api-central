/**
 * model/scheme database RPS
 *
 * v1.0.0
 */
const mongoose = require("mongoose");
const moment = require("moment");
const Schema = mongoose.Schema;

const rpsSchema = Schema(
  {
    rps_created_at: Number,
    rps_date_updated: Number,
    rps_code: String,
    rps_name: String,
    rps_credit: Number,
    rps_semester: Number,
    rps_rev: Number,
    rps_editable: Boolean,
    rps_status: String,
    rps_desc: String,
    rps_materi: String,
    rps_creator: { type: Schema.Types.ObjectId, required: true, ref: "user" },
    rps_validator: { type: Schema.Types.ObjectId, ref: "user" },
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: "rps_created_at",
      updatedAt: "rps_date_updated",
      currentTime: () => moment().unix(),
    },
  }
).index({
  rps_code: 1,
  rps_created_at: 1,
  rps_name: 1,
  rps_credit: 1,
  rps_semester: 1,
  rps_rev: 1,
  rps_status: 1,
  rps_desc: 1,
  rps_materi: 1,
  rps_creator: 1,
  rps_validator: 1,
});

module.exports = mongoose.model("rps", rpsSchema);
