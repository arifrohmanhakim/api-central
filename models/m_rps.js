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
    rps_code: String,
    rps_name: String,
    rps_credit: Number,
    rps_semester: Number,
    rps_rev: Number,
    rps_editable: Boolean,
    rps_status: String,
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: "rps_created_at",
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
});

module.exports = mongoose.model("rps", rpsSchema);
