const mongoose = require("mongoose");
const moment = require("moment");
const Schema = mongoose.Schema;

const assessmentsSchema = Schema(
  {
    assessments_date_created: Number,
    assessments_date_updated: Number,
    assessments_rps_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "rps",
    },
    assessments_name: String,
    assessments_percentage: Number,
    assessments_status: String,
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: "assessments_date_created",
      updatedAt: "assessments_date_updated",
      currentTime: () => moment().unix(),
    },
  }
).index({
  assessments_rps_id: 1,
  assessments_date_created: 1,
  assessments_name: 1,
  assessments_percentage: 1,
  assessments_status: 1,
});

module.exports = mongoose.model("assessments", assessmentsSchema);
