const ControllerRps = require("../controllers/c_rps");
const ControllerLectures = require("../controllers/c_lecturers");

module.exports = (params) => {
  const c_rps = new ControllerRps(params);
  const c_lecturers = new ControllerLectures(params);

  /**
   * ==========================
   * Get Detail RPS
   *
   * _validateDetailRps
   * ==========================
   */
  hook.addFilter(`${appPrefix}_before_get_detail_${rpsPrefix}`, appPrefix, _validateDetailRps, 10, 2); // prettier-ignore
  hook.addFilter(`${appPrefix}_${rpsPrefix}_detail_result`, appPrefix, _modifyRpsDetailResult, 10); // prettier-ignore
  hook.addFilter(`${appPrefix}_${rpsPrefix}_detail_result`, appPrefix, _modifyRpsDetailResultCourseCreator, 20); // prettier-ignore

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

      console.log("result", newResult);
      return newResult;
    } catch (error) {
      return result;
    }
  }

  /**
   * modify / format ulang data yang muncul di user
   * add course creator
   *
   * @param {*} result
   */
  async function _modifyRpsDetailResultCourseCreator(result) {
    try {
      let newResult = await result;
      if (_.isNil(newResult) || _.isEmpty(newResult)) return newResult;

      // get course creator
      const lectureCreator = await c_lecturers._getLecturers({
        rps_id: newResult?.course_id.toString(),
      });

      if (!_.isEmpty(lectureCreator)) {
        const item = _.first(lectureCreator);
        newResult.course_creator = {
          creator_id: item.id,
          creator_name: item.name,
          creator_regno: item.regno,
        };
      }
      return newResult;
    } catch (error) {
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
        newResult.push({
          id: item._id,
          code: item.rps_code,
          name: item.rps_name,
          credit: item.rps_credit,
          semester: item.rps_semester,
          rev: item.rps_rev,
          created_at: item.rps_created_at,
          editable: item.rps_editable,
        });
      }
      return {
        count: result?.total,
        datetime: moment().unix(),
        rps: newResult,
      };
    } catch (error) {
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
  hook.addFilter( `${appPrefix}_validate_post_${rpsPrefix}`, appPrefix, _validateRpsExists, 20, 2 ) // prettier-ignore

  /**
   * Validasi body data
   *
   * @param {*} res
   * @param {*} query
   * @returns
   */
  async function _validateBeforePostRps(res, query) {
    const { code, name, credit, semester, rev } = query;

    if (_.isNil(code) || _.eq(code, "")) return `code required`;
    if (_.isNil(name) || _.eq(name, "")) return `name required`;
    if (_.isNil(credit) || _.eq(credit, "")) return `credit required`;
    if (_.isNil(semester) || _.eq(semester, "")) return `semester required`;
    if (_.isNil(rev) || _.eq(rev, "")) return `rev required`;
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
      if (!_.isEmpty(isExist))
        return `code already exists, please use other code`;
      return res;
    } catch (error) {
      console.log("err:_validateRpsExists", error);
      return res;
    }
  }
};
