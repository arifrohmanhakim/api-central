const ControllerLecturers = require("../controllers/c_lecturers");
const ControllerRps = require("../controllers/c_rps");
const ControllerUser = require("../controllers/c_user");

const { isValidObjectId } = require("../utils/u_helpers");

module.exports = (params) => {
  const c_lecturers = new ControllerLecturers(params);
  const c_rps = new ControllerRps(params);
  const c_user = new ControllerUser(params);

  /**
   * ==========================
   * Post Lecturers
   *
   * _validateBeforePostLecturers
   * _modifyLecturersResult
   * ==========================
   */
  hook.addFilter( `${appPrefix}_validate_post_${lecturersPrefix}`, appPrefix, _validateBeforePostLecturers, 10, 2 ) // prettier-ignore
  hook.addFilter(`${appPrefix}_${lecturersPrefix}_result`, appPrefix, _modifyLecturersResult, 10); // prettier-ignore

  /**
   * Validasi body data
   *
   * @param {*} res
   * @param {*} query
   * @returns
   */
  async function _validateBeforePostLecturers(res, query) {
    try {
      const { rps_id, lecturer_id } = query;

      if (_.isNil(rps_id) || _.eq(rps_id, "")) return `rps_id required`;
      if (_.isNil(lecturer_id) || _.eq(lecturer_id, ""))
        return `lecturer_id required`;

      // validate type is ObjectId
      if (!isValidObjectId(rps_id)) return "rps_id not valid";
      if (!isValidObjectId(lecturer_id)) return "lecturer_id not valid";

      // validate is rps exist
      const isRpsExist = await c_rps._getRpsById(rps_id);
      if (_.isNil(isRpsExist)) return "RPS tidak ditemukan";

      // validate is lecturer exist
      const isUserExist = await c_user._getUserById(lecturer_id);
      if (_.isNil(isUserExist)) return "Lecturer tidak ditemukan";

      // validate already exist

      return res;
    } catch (error) {
      console.log("err: _validateBeforePostLecturers", error);
      return res;
    }
  }

  /**
   * modify / format ulang data yang muncul di user
   *
   * @param {*} result
   */
  async function _modifyLecturersResult(result) {
    try {
      return {
        status: "success",
        message: "dosen berhasil ditambahkan",
        datetime: moment().unix(),
        id: result._id,
      };
    } catch (error) {
      console.log("err:_modifyLecturersResult");
      return result;
    }
  }
};
