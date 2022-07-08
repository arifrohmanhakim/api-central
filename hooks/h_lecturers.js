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
   * Get Lecturers
   *
   * _getLecturersFilterQuery
   * ==========================
   */
  hook.addFilter(`${appPrefix}_validate_get_${lecturersPrefix}`, appPrefix, _validateGetLecturers, 10, 2); // prettier-ignore
  hook.addFilter(`${appPrefix}_${lecturersPrefix}_query`, appPrefix, _getLecturersFilterQuery, 10); // prettier-ignore
  hook.addFilter(`${appPrefix}_${lecturersPrefix}_result`, appPrefix, _modifyLecturersGetResult, 10); // prettier-ignore

  /**
   * Validasi data
   *
   * @param {*} res
   * @param {*} query
   * @returns
   */
  async function _validateGetLecturers(res, query) {
    try {
      const { rps_id, lecturer_id } = query;

      if (_.isNil(rps_id) || _.eq(rps_id, "")) return `rps_id required`;

      // validate type is ObjectId
      if (!isValidObjectId(rps_id)) return "rps_id not valid";
      if (!_.isNil(lecturer_id) && !isValidObjectId(lecturer_id))
        return "lecturer_id not valid";

      return res;
    } catch (error) {
      console.log("err: _validateGetLecturers", error);
      return res;
    }
  }

  /**
   * modify query get Lecturers
   *
   * @param {*} query
   */
  async function _getLecturersFilterQuery(query) {
    try {
      // filter by rpsid
      if (!_.isNil(query?.rps_id)) {
        query.l_rps_id = query?.rps_id;
        delete query.rps_id;
      }
      // filter by lecturer
      if (!_.isNil(query?.lecturer_id)) {
        query.l_user_id = query?.lecturer_id;
        delete query.lecturer_id;
      }

      return query || {};
    } catch (error) {
      console.log("err: _getLecturersFilterQuery", error);
      return query;
    }
  }

  /**
   * modify / format ulang data yang muncul di user
   *
   * @param {*} result
   */
  async function _modifyLecturersGetResult(result) {
    try {
      if (_.isEmpty(result.data)) return result;

      let newResult = [];
      for (let index = 0; index < result.data.length; index++) {
        const item = result.data[index];

        // get userMeta by userId
        let userDetail = {};
        const userMeta = await c_user._getUserMeta({
          u_id: item.l_user_id._id,
        });
        if (!_.isNil(userMeta) && !_.isEmpty(userMeta)) {
          for (let index2 = 0; index2 < userMeta.length; index2++) {
            const itemUser = userMeta[index2];
            userDetail[itemUser.um_key] = itemUser.um_value;
          }
        }

        newResult.push({
          id: item._id,
          name: item.l_user_id.u_fullname,
          ...userDetail,
        });
      }
      return newResult;
    } catch (error) {
      console.log("err:_modifyLecturersResult");
      return result;
    }
  }

  /**
   * ==========================
   * Post Lecturers
   *
   * _validateBeforePostLecturers
   * _modifyLecturersResult
   * ==========================
   */
  hook.addFilter( `${appPrefix}_validate_post_${lecturersPrefix}`, appPrefix, _validateBeforePostLecturers, 10, 2 ) // prettier-ignore
  hook.addFilter(`${appPrefix}_${lecturersPrefix}_post_result`, appPrefix, _modifyLecturersResult, 10); // prettier-ignore

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
