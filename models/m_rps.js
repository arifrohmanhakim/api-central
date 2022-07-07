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
    course_created_at: Number,
    course_created_at: Number,
    u_name: String,
    u_email: String,
    u_password: String,
    u_avatar: String,
    u_status: String,
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: "u_date_created",
      updatedAt: "u_date_updated",
      currentTime: () => moment().unix(),
    },
  }
).index({ u_name: 1, u_date_created: 1, u_email: 1, u_status: 1 });

module.exports = mongoose.model("rps", rpsSchema);
