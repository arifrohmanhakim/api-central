const ControllerRps = require("../controllers/c_rps");
const ControllerLectures = require("../controllers/c_lecturers");
const ControllerRefs = require("../controllers/c_refs");
const ControllerCpmk = require("../controllers/c_cpmk");
const ControllerAssessments = require("../controllers/c_assessments");
const ControllerUser = require("../controllers/c_user");
const ControllerMaster = require("../controllers/c_master");
const ControllerSession = require("../controllers/c_session");

const { isValidObjectId } = require("../utils/u_helpers");

module.exports = (params) => {
  const c_rps = new ControllerRps(params);
  const c_lecturers = new ControllerLectures(params);
  const c_refs = new ControllerRefs(params);
  const c_assessments = new ControllerAssessments(params);
  const c_user = new ControllerUser(params);
  const c_cpmk = new ControllerCpmk(params);
  const c_master = new ControllerMaster(params);
  const c_session = new ControllerSession(params);

  /**
   * ==========================
   * Get Detail RPS
   *
   * _validateDetailRps
   * ==========================
   */
  hook.addFilter(`${appPrefix}_before_get_detail_${rpsPrefix}`, appPrefix, _validateDetailRps, 10, 2); // prettier-ignore
  hook.addFilter(`${appPrefix}_${rpsPrefix}_detail_result`, appPrefix, _modifyRpsDetailResult, 10); // prettier-ignore
  hook.addFilter(`${appPrefix}_${rpsPrefix}_detail_result`, appPrefix, _modifyRpsDetailResultCourseCreatorValidator, 20); // prettier-ignore
  hook.addFilter(`${appPrefix}_${rpsPrefix}_detail_result`, appPrefix, _modifyRpsDetailResultCourseCPMK, 30); // prettier-ignore
  hook.addFilter(`${appPrefix}_${rpsPrefix}_detail_result`, appPrefix, _modifyRpsDetailResultCourseReferences, 40); // prettier-ignore
  hook.addFilter(`${appPrefix}_${rpsPrefix}_detail_result`, appPrefix, _modifyRpsDetailResultCourseAssessment, 50); // prettier-ignore
  hook.addFilter(`${appPrefix}_${rpsPrefix}_detail_result`, appPrefix, _modifyRpsDetailResultCoursePlans, 60); // prettier-ignore

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
        course_validated_at: result?.rps_validated_at,
        course_creator: result?.rps_creator,
        course_validator: result?.rps_validator,
      };

      return newResult;
    } catch (error) {
      return result;
    }
  }

  /**
   * add creator and validator
   * add course creator and validator
   *
   * @param {*} result
   */
  async function _modifyRpsDetailResultCourseCreatorValidator(result) {
    try {
      result = await result;
      if (_.isNil(result) || _.isEmpty(result)) return result;

      let _result = _.cloneDeep(result);
      // add creator
      if (!_.isNil(result?.course_creator)) {
        result.course_creator = {
          creator_id: _result?.course_creator?._id,
          creator_name: _result?.course_creator?.u_fullname,
        };

        // get user meta
        const creatorMeta = await c_user._getUserMeta({
          u_id: _result?.course_creator?._id,
          um_key: "regno",
        });
        if (!_.isEmpty(creatorMeta)) {
          result.course_creator = {
            ...result.course_creator,
            creator_regno: creatorMeta[0].um_value,
          };
        }
      }

      // add validator
      if (!_.isNil(_result?.course_validator)) {
        result.course_validator = {
          validator_id: _result?.course_validator?._id,
          validator_name: _result?.course_validator?.u_fullname,
        };
        // get user meta
        const validatorMeta = await c_user._getUserMeta({
          u_id: _result?.course_validator?._id,
          um_key: "regno",
        });
        if (!_.isEmpty(validatorMeta)) {
          result.course_validator = {
            ...result.course_validator,
            validator_regno: validatorMeta[0].um_value,
          };
        }
      }

      return result;
    } catch (error) {
      console.log("err: _modifyRpsDetailResultCourseCreatorValidator", error);
    }
  }

  /**
   * add cpmk - course lo
   * add course cpmk - course lo
   *
   * @param {*} result
   */
  async function _modifyRpsDetailResultCourseCPMK(result) {
    try {
      result = await result;
      if (_.isNil(result) || _.isEmpty(result)) return result;
      // get course lo
      const courseLo = await c_cpmk._getCpmk({
        rps_id: result?.course_id.toString(),
        status: "active",
        raw: true,
      });
      let curriculum_lo = [];
      result.curriculum_lo = [];
      if (!_.isEmpty(courseLo.data)) {
        result.course_lo = [];
        for (let index = 0; index < courseLo.data.length; index++) {
          const itemLo = courseLo.data[index];
          result.course_lo = [
            ...result.course_lo,
            {
              id: itemLo._id,
              code: itemLo.cpmk_code,
              lo_name: itemLo.cpmk_name,
            },
          ];
          curriculum_lo = [...curriculum_lo, ...itemLo.cpmk_clo_ids];
        }
      } else {
        result.course_lo = [];
      }
      curriculum_lo = _.uniq(curriculum_lo);
      // get master cp by id
      for (let index = 0; index < curriculum_lo.length; index++) {
        const cItem = curriculum_lo[index];
        const getMasterCurriculum = await c_master._getMasterById(cItem);
        if (!_.isNil(getMasterCurriculum)) {
          result.curriculum_lo.push({
            id: getMasterCurriculum._id,
            code: getMasterCurriculum.code,
            lo_name: getMasterCurriculum.master_title,
          });
        }
      }

      return result;
    } catch (error) {
      console.log("err: _modifyRpsDetailResultCourseCPMK", error);
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
      if (!_.isEmpty(referencesCreator.refs)) {
        newResult.course_references = referencesCreator.refs;
      } else {
        newResult.course_references = [];
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
      if (!_.isEmpty(assessmentsCreator.assessments)) {
        newResult.course_assessments = assessmentsCreator.assessments;
      }
      return newResult;
    } catch (error) {
      console.log("err:_modifyRpsDetailResultCourseAssessments", error);
      return result;
    }
  }

  /**
   * add course plans
   *
   * @param {*} result
   */
  async function _modifyRpsDetailResultCoursePlans(result) {
    try {
      let newResult = await result;
      if (_.isNil(newResult) || _.isEmpty(newResult)) return newResult;

      // get course session
      const sessions = await c_session._getSession({
        rps_id: newResult?.course_id.toString(),
        status: "active",
      });
      newResult.course_plans = [];
      if (!_.isEmpty(sessions.weekly)) {
        for (let index = 0; index < sessions.weekly.length; index++) {
          const plan = sessions.weekly[index];
          let planResult = {
            id: plan.id,
            week: plan.week_no,
            material: plan.material,
            method: plan.method,
            student_exp: plan.student_exp,
            references: [],
            assessments: [],
          };

          // references
          for (let indexRefs = 0; indexRefs < plan.refs.length; indexRefs++) {
            const refs = plan.refs[indexRefs];
            const refsResult = await c_refs._getRefsById(refs);
            planResult.references.push({
              ref_id: refsResult._id,
              ref_name: refsResult.refs_title,
              ref_desc: refsResult.refs_description,
            });
          }

          // assessments
          for (
            let indexAssessments = 0;
            indexAssessments < plan.refs.length;
            indexAssessments++
          ) {
            const assessments = plan.assessments[indexAssessments];
            const assessmentsResult = await c_assessments._getAssessmentsById(
              assessments
            );
            planResult.assessments.push({
              id: assessmentsResult._id,
              name: assessmentsResult.assessments_name,
              percentage: assessmentsResult.assessments_percentage,
            });
          }

          newResult.course_plans.push(planResult);
        }
      }
      return newResult;
    } catch (error) {
      console.log("err:_modifyRpsDetailResultCoursePlanss", error);
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
