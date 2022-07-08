const mongoose = require("mongoose");
const moment = require("moment");
const Schema = mongoose.Schema;

const refsSchema = Schema(
  {
    refs_date_created: Number,
    refs_date_updated: Number,
    refs_rps_id: { type: Schema.Types.ObjectId, required: true, ref: "rps" },
    refs_title: String,
    refs_author: String,
    refs_publisher: String,
    refs_year: Number,
    refs_description: String,
    refs_category: String,
    refs_status: String,
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: "refs_date_created",
      updatedAt: "refs_date_updated",
      currentTime: () => moment().unix(),
    },
  }
).index({
  refs_rps_id: 1,
  refs_date_created: 1,
  refs_title: 1,
  refs_author: 1,
  refs_publisher: 1,
  refs_year: 1,
  refs_description: 1,
  refs_category: 1,
  refs_status: 1,
});

module.exports = mongoose.model("refs", refsSchema);
