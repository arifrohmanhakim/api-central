const mongoose = require("mongoose");
const moment = require("moment");
const Schema = mongoose.Schema;

const sessionSchema = Schema(
  {
    session_date_created: Number,
    session_date_updated: Number,
    session_rps_id: { type: Schema.Types.ObjectId, required: true, ref: "rps" },
    session_week_no: Number,
    session_material: String,
    session_method: String,
    session_student_exp: String,
    session_los: String,
    session_assessments: String,
    session_refs: String,
    session_status: String,
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: "session_date_created",
      updatedAt: "session_date_updated",
      currentTime: () => moment().unix(),
    },
  }
).index({
  session_rps_id: 1,
  session_date_created: 1,
  session_week_no: 1,
  session_material: 1,
  session_method: 1,
  session_student_exp: 1,
  session_los: 1,
  session_assessments: 1,
  session_refs: 1,
  session_status: 1,
});

module.exports = mongoose.model("session", sessionSchema);
