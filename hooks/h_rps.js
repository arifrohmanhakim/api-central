const ControllerRps = require("../controllers/c_rps");
const ControllerLectures = require("../controllers/c_lecturers");
const ControllerRefs = require("../controllers/c_refs");
const ControllerAssessments = require("../controllers/c_assessments");
const ControllerUser = require("../controllers/c_user");

const { isValidObjectId } = require("../utils/u_helpers");

module.exports = (params) => {
  const c_rps = new ControllerRps(params);
  const c_lecturers = new ControllerLectures(params);
  const c_refs = new ControllerRefs(params);
  const c_assessments = new ControllerAssessments(params);
  const c_user = new ControllerUser(params);

  /**
   * ==========================
   * Get Detail RPS
   *
   * _validateDetailRps
   * ==========================
   */
  hook.addFilter(`${appPrefix}_before_get_detail_${rpsPrefix}`, appPrefix, _validateDetailRps, 10, 2); // prettier-ignore
  // hook.addFilter(`${appPrefix}_${rpsPrefix}_detail_result`, appPrefix, _modifyRpsDetailResult, 10); // prettier-ignore
  // hook.addFilter(`${appPrefix}_${rpsPrefix}_detail_result`, appPrefix, _modifyRpsDetailResultCourseReferences, 30); // prettier-ignore
  // hook.addFilter(`${appPrefix}_${rpsPrefix}_detail_result`, appPrefix, _modifyRpsDetailResultCourseAssessment, 40); // prettier-ignore

  /**
   * validate resId
   *
   * @param {*} res
   * @param {*} rpsId
   * @returns
   */
  async function _validateDetailRps(res, rpsId) {
    try {
      if (_.isNil(rpsId) || _.eq(rpsId, "")) return `resId required`;

      return res;
    } catch (error) {
      return res;
    }
  }

  /**
   * modify / format ulang data yang muncul di user
   *
   * @param {*} result
   */
  async function _modifyRpsDetailResult(result) {
    try {
      if (_.isNil(result) || _.isEmpty(result)) return result;
      let newResult = {
        course_id: result?._id,
        course_code: result?.rps_code,
        course_name: result?.rps_name,
        course_credit: result?.rps_credit,
        course_desc: result?.rps_desc,
        course_rev: result?.rps_rev,
        course_semester: result?.rps_semester,
        course_material: result?.rps_materi,
        course_created_at: result?.rps_created_at,
      };

      // add creator
      if (!_.isNil(result?.rps_creator)) {
        newResult.course_creator = {
          id: result?.rps_creator?._id,
          name: result?.rps_creator?.u_fullname,
        };

        // get user meta
        const creatorMeta = await c_user._getUserMeta({
          u_id: result?.rps_creator?._id,
          um_key: "regno",
        });
        if (!_.isEmpty(creatorMeta)) {
          newResult.course_creator = {
            ...newResult.course_creator,
            [creatorMeta[0].um_key]: creatorMeta[0].um_value,
          };
        }
      }

      // add validator
      if (!_.isNil(result?.rps_validator)) {
        newResult.course_validator = {
          id: result?.rps_validator?._id,
          name: result?.rps_validator?.u_fullname,
        };
      }

      return newResult;
    } catch (error) {
      return result;
    }
  }

  /**
   * add references
   * add course references
   *
   * @param {*} result
   */
  async function _modifyRpsDetailResultCourseReferences(result) {
    try {
      let newResult = await result;
      if (_.isNil(newResult) || _.isEmpty(newResult)) return newResult;

      // get course references
      const referencesCreator = await c_refs._getRefs({
        rps_id: newResult?.course_id.toString(),
        status: "active",
      });
      if (!_.isEmpty(referencesCreator.references)) {
        newResult.course_references = referencesCreator.references;
      }
      return newResult;
    } catch (error) {
      console.log("err:_modifyRpsDetailResultCourseReferences", error);
      return result;
    }
  }

  /**
   * add assessments
   * add course suara
   *
   * @param {*} result
   */
  async function _modifyRpsDetailResultCourseAssessment(result) {
    try {
      let newResult = await result;
      if (_.isNil(newResult) || _.isEmpty(newResult)) return newResult;

      // get course assessments
      const assessmentsCreator = await c_assessments._getAssessments({
        rps_id: newResult?.course_id.toString(),
        status: "active",
      });
      if (!_.isEmpty(assessmentsCreator.data)) {
        newResult.course_assessments = assessmentsCreator.data;
      }
      return newResult;
    } catch (error) {
      console.log("err:_modifyRpsDetailResultCourseAssessments", error);
      return result;
    }
  }

  /**
   * ==========================
   * Get RPS
   *
   * _getRpsFilterQuery
   * ==========================
   */
  hook.addFilter(`${appPrefix}_${rpsPrefix}_query`, appPrefix, _getRpsFilterQuery, 10); // prettier-ignore
  hook.addFilter(`${appPrefix}_${rpsPrefix}_result`, appPrefix, _modifyRpsResult, 10); // prettier-ignore

  /**
   * modify query get rps
   *
   * @param {*} query
   */
  async function _getRpsFilterQuery(query) {
    try {
      // filter by keyword
      if (!_.isNil(query?.keyword)) {
        const keyword = { $regex: query?.keyword, $options: "i" };
        query = {
          ...query,
          $or: [{ rps_code: keyword }, { rps_name: keyword }],
        };
        delete query.keyword;
      }

      // filter by id
      if (!_.isNil(query?.rps_id)) {
        query._id = query?.rps_id;
        delete query.rps_id;
      }

      // filter by code
      if (!_.isNil(query?.code)) {
        query.rps_code = query?.code;
        delete query.code;
      }

      // filter by name
      if (!_.isNil(query?.name)) {
        const name = { $regex: query?.name, $options: "i" };
        query.rps_name = name;
        delete query.name;
      }

      // filter by credit
      if (!_.isNil(query?.credit)) {
        query.rps_credit = query?.credit;
        delete query.credit;
      }

      // filter by semester
      if (!_.isNil(query?.semester)) {
        query.rps_semester = query?.semester;
        delete query.semester;
      }

      // filter by rev
      if (!_.isNil(query?.rev)) {
        query.rps_rev = query?.rev;
        delete query.rev;
      }

      // filter by status
      if (!_.isNil(query?.status)) {
        query.rps_status = query?.status;
        delete query.status;
      }

      // filter by editable
      if (!_.isNil(query?.editable)) {
        query.rps_editable = query?.editable;
        delete query.editable;
      }

      // filter by desc
      if (!_.isNil(query?.desc)) {
        query.rps_desc = query?.desc;
        delete query.desc;
      }

      // filter by materi
      if (!_.isNil(query?.materi)) {
        query.rps_materi = query?.materi;
        delete query.materi;
      }

      return query || {};
    } catch (error) {
      console.log("err: _getRpsFilterQuery", error);
      return query;
    }
  }

  /**
   * modify / format ulang data yang muncul di user
   *
   * @param {*} result
   */
  async function _modifyRpsResult(result) {
    try {
      if (_.isEmpty(result?.data)) return result;
      let newResult = [];
      for (let index = 0; index < result?.data.length; index++) {
        const item = result?.data[index];
        let params = {
          id: item._id,
          code: item.rps_code,
          name: item.rps_name,
          credit: item.rps_credit,
          semester: item.rps_semester,
          rev: item.rps_rev,
          created_at: item.rps_created_at,
          editable: item.rps_editable,
          status: item.rps_status,
        };

        // add creator
        if (!_.isNil(item?.rps_creator)) {
          params.creator = {
            id: item?.rps_creator?._id,
            name: item?.rps_creator?.u_fullname,
          };

          // get regno from user meta
          const creatorMeta = await c_user._getUserMeta({
            u_id: item?.rps_creator?._id,
            um_key: "regno",
          });
          if (!_.isEmpty(creatorMeta)) {
            params.creator = {
              ...params.creator,
              [creatorMeta[0].um_key]: creatorMeta[0].um_value,
            };
          }
        }

        // add validator
        if (!_.isNil(item?.rps_validator)) {
          params.validator = {
            id: item?.rps_validator?._id,
            name: item?.rps_validator?.u_fullname,
          };

          // get regno from user meta
          const validatorMeta = await c_user._getUserMeta({
            u_id: item?.rps_validator?._id,
            um_key: "regno",
          });
          if (!_.isEmpty(validatorMeta)) {
            params.validator = {
              ...params.validator,
              [validatorMeta[0].um_key]: validatorMeta[0].um_value,
            };
          }
        }
        newResult.push(params);
      }
      return {
        count: result?.total,
        datetime: moment().unix(),
        rps: newResult,
      };
    } catch (error) {
      console.log("err: _modifyRpsResult", error);
      return result;
    }
  }

  /**
   * ==========================
   * Post Rps
   *
   * _validateBeforePostRps
   * _validateRpsExists
   * ==========================
   */
  hook.addFilter( `${appPrefix}_validate_post_${rpsPrefix}`, appPrefix, _validateBeforePostRps, 10, 2 ) // prettier-ignore
  hook.addFilter( `${appPrefix}_${rpsPrefix}_post_params`, appPrefix, _modifyPostParams, 10, 2 ) // prettier-ignore
  hook.addFilter( `${appPrefix}_validate_post_${rpsPrefix}`, appPrefix, _validateRpsExists, 20, 2 ) // prettier-ignore

  /**
   * Validasi body data
   *
   * @param {*} res
   * @param {*} query
   * @returns
   */
  async function _validateBeforePostRps(res, query) {
    const { code, name, credit, semester, rev, creator, validator } = query;

    if (_.isNil(code) || _.eq(code, "")) return `code required`;
    if (_.isNil(name) || _.eq(name, "")) return `name required`;
    if (_.isNil(credit) || _.eq(credit, "")) return `credit required`;
    if (_.isNil(semester) || _.eq(semester, "")) return `semester required`;
    if (_.isNil(rev) || _.eq(rev, "")) return `rev required`;
    if (_.isNil(creator) || _.eq(creator, "")) return `creator required`;

    if (!isValidObjectId(creator)) return "creator not valid";

    // validate is creator exist
    const isUserExist = await c_user._getUserById(creator);
    if (_.isNil(isUserExist)) return "User Creator tidak ditemukan";

    if (!_.isNil(validator) && !isValidObjectId(validator)) {
      // validate is validator exist
      const isUserExist = await c_user._getUserById(validator);
      if (_.isNil(isUserExist)) return "User Validator tidak ditemukan";
      return "validator not valid";
    }
    return res;
  }

  /**
   * Cek apakah rps dengan code yang dimaskkan sudh terdaftar/blm
   *
   * @param {*} res
   * @param {*} query
   * @returns
   */
  async function _validateRpsExists(res, query) {
    try {
      const { code } = query;
      const isExist = await c_rps._getRps({ rps_code: code });
      if (!_.isEmpty(isExist.data))
        return `code already exists, please use other code`;
      return res;
    } catch (error) {
      console.log("err:_validateRpsExists", error);
      return res;
    }
  }

  /**
   * modify params before post
   *
   * @param {*} params
   * @param {*} query
   */
  async function _modifyPostParams(params, query) {
    try {
      if (!_.isNil(query?.validator) && !_.eq(query?.validator, "")) {
        params.rps_validator = query?.validator || "";
      }
      return params;
    } catch (error) {
      console.log("err: _modifyPostParams", error);
      return params;
    }
  }
};
