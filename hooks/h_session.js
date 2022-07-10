const ControllerSession = require("../controllers/c_session");
const ControllerRps = require("../controllers/c_rps");
const { isValidObjectId, isJson } = require("../utils/u_helpers");

module.exports = (params) => {
  const c_session = new ControllerSession(params);
  const c_rps = new ControllerRps(params);

  /**
   * ==========================
   * Get session
   *
   * _getsessionFilterQuery
   * ==========================
   */
  hook.addFilter(`${appPrefix}_${sessionPrefix}_query`, appPrefix, _getSessionFilterQuery, 10); // prettier-ignore
  hook.addFilter(`${appPrefix}_${sessionPrefix}_get_result`, appPrefix, _modifySessionGetResult, 10); // prettier-ignore

  /**
   * modify query get session
   *
   * @param {*} query
   */
  async function _getSessionFilterQuery(query) {
    try {
      // filter by status
      if (!_.isNil(query?.status)) {
        query.session_status = query?.status;
        delete query.status;
      }
      // filter by rps_id
      if (!_.isNil(query?.rps_id)) {
        query.session_rps_id = query?.rps_id;
        delete query.rps_id;
      }
      // filter by week_no
      if (!_.isNil(query?.week_no)) {
        query.session_week_no = query?.week_no;
        delete query.week_no;
      }
      // filter by material
      if (!_.isNil(query?.material)) {
        query.session_material = query?.material;
        delete query.material;
      }
      // filter by method
      if (!_.isNil(query?.method)) {
        query.session_method = query?.method;
        delete query.method;
      }
      // filter by student_exp
      if (!_.isNil(query?.student_exp)) {
        query.session_student_exp = query?.student_exp;
        delete query.student_exp;
      }

      return query || {};
    } catch (error) {
      console.log("err: _getSessionFilterQuery", error);
      return query;
    }
  }

  /**
   * modify / format ulang data yang muncul di user
   *
   * @param {*} result
   */
  async function _modifySessionGetResult(result) {
    try {
      if (_.isEmpty(result?.data)) return result;
      let newResult = [];
      for (let index = 0; index < result?.data.length; index++) {
        const item = result?.data[index];
        newResult.push({
          id: item._id,
          week_no: item.session_week_no,
          material: item.session_material,
          method: item.session_method,
          student_exp: item.session_student_exp,
          los: isJson(item.session_los)
            ? JSON.parse(item.session_los)
            : item.session_los,
          assessments: isJson(item.session_assessments)
            ? JSON.parse(item.session_assessments)
            : item.session_assessments,
          refs: isJson(item.session_refs)
            ? JSON.parse(item.session_refs)
            : item.session_refs,
          status: item.session_status,
        });
      }
      return {
        count: result?.total,
        datetime: moment().unix(),
        weekly: newResult,
      };
    } catch (error) {
      console.log("err:_modifySessionGetResult", error);
      return result;
    }
  }

  /**
   * ==========================
   * Post Session
   *
   * _validateBeforePostSession
   * ==========================
   */
  hook.addFilter( `${appPrefix}_validate_post_${sessionPrefix}`, appPrefix, _validateBeforePostSession, 10, 2 ) // prettier-ignore

  /**
   * Validasi body data
   *
   * @param {*} res
   * @param {*} query
   * @returns
   */
  async function _validateBeforePostSession(res, query) {
    try {
      const {
        rps_id,
        week_no,
        material,
        method,
        student_exp,
        los,
        assessments,
        refs,
        status,
      } = query;

      if (_.isNil(rps_id) || _.eq(rps_id, "")) return `rps_id required`;
      if (_.isNil(week_no) || _.eq(week_no, "")) return `week_no required`;
      if (_.isNil(material) || _.eq(material, "")) return `material required`;
      if (_.isNil(method) || _.eq(method, "")) return `method required`;
      if (_.isNil(student_exp) || _.eq(student_exp, ""))
        return `student_exp required`;
      if (_.isNil(los) || _.isEmpty(los)) return `los required`;
      if (_.isNil(assessments) || _.isEmpty(assessments))
        return `assessments required`;
      if (_.isNil(refs) || _.isEmpty(refs)) return `refs required`;

      // validate type is ObjectId
      if (!isValidObjectId(rps_id)) return "rps_id not valid";

      // validate is rps exist
      const isRpsExist = await c_rps._getRpsById(rps_id);
      if (_.isNil(isRpsExist)) return "RPS tidak ditemukan";

      return res;
    } catch (error) {
      console.log("err: _validateBeforePostSession", error);
      return res;
    }
  }

  /**
   * ==========================
   * put Session
   *
   * _validateBeforeputSession
   * ==========================
   */
  hook.addFilter(`${appPrefix}_${sessionPrefix}_put_result`, appPrefix, _modifySessionPutResult, 10); // prettier-ignore

  /**
   * modify / format ulang data yang muncul di user
   *
   * @param {*} result
   */
  async function _modifySessionPutResult(result) {
    try {
      return {
        status: "success",
        message: "berhasil merubah data session",
        datetime: moment().unix(),
        id: result._id,
      };
    } catch (error) {
      console.log("err:_modifySessionGetResult", error);
      return result;
    }
  }

  /**
   * ==========================
   * Delete Session
   *
   * _validateBeforeDeleteSession
   * ==========================
   */
  hook.addFilter(`${appPrefix}_validate_delete_${sessionPrefix}`, appPrefix, _validateBeforeDeleteSession, 10, 2); // prettier-ignore
  hook.addFilter(`${appPrefix}_${sessionPrefix}_delete_result`, appPrefix, _modifySessionDeleteResult, 10); // prettier-ignore

  /**
   * Validasi body data
   *
   * @param {*} resolve
   * @param {*} query
   * @returns
   */
  async function _validateBeforeDeleteSession(res, query) {
    try {
      const { session_id, rps_id } = query;
      // check is rps_id not empty
      if (_.isNil(rps_id) || _.eq(rps_id, "")) return `rps_id required`;

      // check is session_id not empty
      if (_.isNil(session_id) || _.eq(session_id, ""))
        return `session_id required`;

      // validate type is ObjectId
      if (!isValidObjectId(rps_id)) return "rps_id not valid";
      if (!isValidObjectId(session_id)) return "session_id not valid";

      return res;
    } catch (error) {
      _e("err: _validateBeforeDeleteSession", error);
      return error.message;
    }
  }

  /**
   * modify / format ulang data yang muncul di user
   *
   * @param {*} result
   */
  async function _modifySessionDeleteResult(result) {
    try {
      return {
        status: "success",
        message: "berhasil menghapus data session",
        datetime: moment().unix(),
        id: result._id,
      };
    } catch (error) {
      console.log("err:_modifySessionDeleteResult", error);
      return result;
    }
  }
};
