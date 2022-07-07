const mongoose = require("mongoose");
const moment = require("moment");
const Schema = mongoose.Schema;

const userSchema = Schema(
  {
    u_date_created: Number,
    u_date_updated: Number,
    u_fullname: String,
    u_username: String,
    u_password: String,
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
).index({ u_fullname: 1, u_date_created: 1, u_username: 1, u_status: 1 });

module.exports = mongoose.model("user", userSchema);
