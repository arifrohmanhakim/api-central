const mongoose = require("mongoose");
const moment = require("moment");
const Schema = mongoose.Schema;

const lecturersSchema = Schema(
  {
    l_date_created: Number,
    l_date_updated: Number,
    l_name: String,
    l_regno: String,
    l_status: String,
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: "l_date_created",
      updatedAt: "l_date_updated",
      currentTime: () => moment().unix(),
    },
  }
).index({ l_name: 1, l_date_created: 1, l_regno: 1, l_status: 1 });

module.exports = mongoose.model("lecturers", lecturersSchema);
