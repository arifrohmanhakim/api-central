const ControllerAssessments = require("../controllers/c_assessments");
const ControllerRps = require("../controllers/c_rps");
const { isValidObjectId } = require("../utils/u_helpers");

module.exports = (params) => {
  const c_assessments = new ControllerAssessments(params);
  const c_rps = new ControllerRps(params);

  /**
   * ==========================
   * Get assessments
   *
   * _getassessmentsFilterQuery
   * ==========================
   */
  hook.addFilter(`${appPrefix}_${assessmentsPrefix}_query`, appPrefix, _getAssessmentsFilterQuery, 10); // prettier-ignore
  hook.addFilter(`${appPrefix}_${assessmentsPrefix}_get_result`, appPrefix, _modifyAssessmentsGetResult, 10, 2); // prettier-ignore

  /**
   * modify query get assessments
   *
   * @param {*} query
   */
  async function _getAssessmentsFilterQuery(query) {
    try {
      // filter by status
      if (!_.isNil(query?.status)) {
        query.assessments_status = query?.status;
        delete query.status;
      }
      // filter by name
      if (!_.isNil(query?.name)) {
        query.assessments_name = query?.name;
        delete query.name;
      }

      return query || {};
    } catch (error) {
      console.log("err: _getAssessmentsFilterQuery", error);
      return query;
    }
  }

  /**
   * modify / format ulang data yang muncul di user
   *
   * @param {*} result
   */
  async function _modifyAssessmentsGetResult(result, query) {
    try {
      if (_.isEmpty(result?.data)) return result;
      if (!_.isNil(query?.raw) && query?.raw) return result;
      let newResult = [];
      for (let index = 0; index < result?.data.length; index++) {
        const item = result?.data[index];
        newResult.push({
          id: item._id,
          name: item.assessments_name,
          percentage: item.assessments_percentage,
          status: item.assessments_status,
        });
      }
      return {
        count: result?.total,
        datetime: moment().unix(),
        assessments: newResult,
      };
    } catch (error) {
      console.log("err:_modifyAssessmentsGetResult", error);
      return result;
    }
  }

  /**
   * ==========================
   * Post Assessments
   *
   * _validateBeforePostAssessments
   * ==========================
   */
  hook.addFilter( `${appPrefix}_validate_post_${assessmentsPrefix}`, appPrefix, _validateBeforePostAssessments, 10, 2 ) // prettier-ignore

  /**
   * Validasi body data
   *
   * @param {*} res
   * @param {*} query
   * @returns
   */
  async function _validateBeforePostAssessments(res, query) {
    try {
      const { rps_id, name, percentage, status } = query;

      if (_.isNil(rps_id) || _.eq(rps_id, "")) return `rps_id required`;
      if (_.isNil(name) || _.eq(name, "")) return `name required`;
      if (_.isNil(percentage) || _.eq(percentage, ""))
        return `percentage required`;

      // validate type is ObjectId
      if (!isValidObjectId(rps_id)) return "rps_id not valid";

      // validate is rps exist
      const isRpsExist = await c_rps._getRpsById(rps_id);
      if (_.isNil(isRpsExist)) return "RPS tidak ditemukan";

      return res;
    } catch (error) {
      console.log("err: _validateBeforePostAssessments", error);
      return res;
    }
  }

  /**
   * ==========================
   * put Assessments
   *
   * _validateBeforeputAssessments
   * ==========================
   */
  hook.addFilter(`${appPrefix}_${assessmentsPrefix}_put_result`, appPrefix, _modifyAssessmentsPutResult, 10); // prettier-ignore

  /**
   * modify / format ulang data yang muncul di user
   *
   * @param {*} result
   */
  async function _modifyAssessmentsPutResult(result) {
    try {
      return {
        status: "success",
        message: "berhasil merubah data assessments",
        datetime: moment().unix(),
        id: result._id,
      };
    } catch (error) {
      console.log("err:_modifyAssessmentsGetResult", error);
      return result;
    }
  }

  /**
   * ==========================
   * Delete Assessments
   *
   * _validateBeforeDeleteAssessments
   * ==========================
   */
  hook.addFilter(`${appPrefix}_validate_delete_${assessmentsPrefix}`, appPrefix, _validateBeforeDeleteAssessments, 10, 2); // prettier-ignore
  hook.addFilter(`${appPrefix}_${assessmentsPrefix}_delete_result`, appPrefix, _modifyAssessmentsDeleteResult, 10); // prettier-ignore

  /**
   * Validasi body data
   *
   * @param {*} resolve
   * @param {*} query
   * @returns
   */
  async function _validateBeforeDeleteAssessments(res, query) {
    try {
      const { assessments_id, rps_id } = query;
      // check is rps_id not empty
      if (_.isNil(rps_id) || _.eq(rps_id, "")) return `rps_id required`;

      // check is assessments_id not empty
      if (_.isNil(assessments_id) || _.eq(assessments_id, ""))
        return `assessments_id required`;

      // validate type is ObjectId
      if (!isValidObjectId(rps_id)) return "rps_id not valid";
      if (!isValidObjectId(assessments_id)) return "assessments_id not valid";

      return res;
    } catch (error) {
      _e("err: _validateBeforeDeleteAssessments", error);
      return error.message;
    }
  }

  /**
   * modify / format ulang data yang muncul di user
   *
   * @param {*} result
   */
  async function _modifyAssessmentsDeleteResult(result) {
    try {
      return {
        status: "success",
        message: "berhasil menghapus data assessments",
        datetime: moment().unix(),
        id: result._id,
      };
    } catch (error) {
      console.log("err:_modifyAssessmentsDeleteResult", error);
      return result;
    }
  }
};
