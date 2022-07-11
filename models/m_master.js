const mongoose = require("mongoose");
const moment = require("moment");
const Schema = mongoose.Schema;

const masterSchema = Schema(
  {
    master_date_created: Number,
    master_date_updated: Number,
    master_title: String,
    master_content: String,
    master_author: { type: Schema.Types.ObjectId, required: true, ref: "user" },
    master_type: String,
    master_parent: String,
    master_status: String,
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: "master_date_created",
      updatedAt: "master_date_updated",
      currentTime: () => moment().unix(),
    },
  }
).index({
  master_date_created: 1,
  master_title: 1,
  master_content: 1,
  master_author: 1,
  master_type: 1,
  master_status: 1,
});

module.exports = mongoose.model("master", masterSchema);
