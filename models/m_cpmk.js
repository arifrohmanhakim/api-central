const mongoose = require("mongoose");
const moment = require("moment");
const Schema = mongoose.Schema;

const cpmkSchema = Schema(
  {
    cpmk_date_created: Number,
    cpmk_date_updated: Number,
    cpmk_rps_id: { type: Schema.Types.ObjectId, required: true, ref: "rps" },
    cpmk_code: String,
    cpmk_name: String,
    cpmk_clo_ids: Array,
    cpmk_status: String,
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: "cpmk_date_created",
      updatedAt: "cpmk_date_updated",
      currentTime: () => moment().unix(),
    },
  }
).index({
  cpmk_rps_id: 1,
  cpmk_date_created: 1,
  cpmk_code: 1,
  cpmk_name: 1,
  cpmk_clo_ids: 1,
  cpmk_status: 1,
});

module.exports = mongoose.model("cpmk", cpmkSchema);
