const ControllerRps = require("../controllers/c_rps");

module.exports = (params) => {
  const c_rps = new ControllerRps(params);

  /**
   * ==========================
   * Get RPS
   *
   * _getRpsFilterQuery
   * ==========================
   */
  hook.addFilter(`${appPrefix}_${rpsPrefix}_query`, appPrefix, _getRpsFilterQuery, 10); // prettier-ignore

  /**
   * modify query get rps
   *
   * @param {*} query
   */
  async function _getRpsFilterQuery(query) {
    try {
      const { code, name, credit, semester, rev, status, editable } = query;

      // filter by code
      if (!_.isNil(code)) {
        query.rps_code = code;
      }

      // filter by name
      if (!_.isNil(name)) {
        query.rps_name = name;
      }

      // filter by name
      if (!_.isNil(credit)) {
        query.rps_credit = credit;
      }

      // filter by semester
      if (!_.isNil(semester)) {
        query.rps_semester = semester;
      }

      // filter by rev
      if (!_.isNil(rev)) {
        query.rps_rev = rev;
      }

      // filter by status
      if (!_.isNil(status)) {
        query.rps_status = status;
      }

      // filter by editable
      if (!_.isNil(editable)) {
        query.rps_editable = editable;
      }

      return query;
    } catch (error) {
      console.log("err: _getRpsFilterQuery", error);
      return query;
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
