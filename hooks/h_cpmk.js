const ControllerCpmk = require("../controllers/c_cpmk");
const ControllerRps = require("../controllers/c_rps");
const { isValidObjectId } = require("../utils/u_helpers");

module.exports = (params) => {
  const c_cpmk = new ControllerCpmk(params);
  const c_rps = new ControllerRps(params);

  /**
   * ==========================
   * Get Cpmk
   *
   * _modifyCpmkGetResult
   * ==========================
   */
  hook.addFilter(`${appPrefix}_${cpmkPrefix}_query`, appPrefix, _getCpmkFilterQuery, 10); // prettier-ignore
  hook.addFilter(`${appPrefix}_${cpmkPrefix}_get_result`, appPrefix, _modifyCpmkGetResult, 10, 2); // prettier-ignore

  /**
   * modify query get cpmk
   *
   * @param {*} query
   */
  async function _getCpmkFilterQuery(query) {
    try {
      // filter by code
      if (!_.isNil(query?.code)) {
        query.cpmk_code = query?.code;
        delete query.code;
      }

      // filter by status
      if (!_.isNil(query?.status)) {
        query.cpmk_status = query?.status;
        delete query.status;
      }

      return query || {};
    } catch (error) {
      console.log("err: _getCpmkFilterQuery", error);
      return query;
    }
  }

  /**
   * modify / format ulang data yang muncul di user
   *
   * @param {*} result
   * @param {*} query
   */
  async function _modifyCpmkGetResult(result, query) {
    try {
      if (_.isEmpty(result?.data)) return result;
      if (!_.isNil(query?.raw) && query?.raw) return result;
      let newResult = [];
      for (let index = 0; index < result?.data.length; index++) {
        const item = result?.data[index];
        newResult.push({
          id: item._id,
          code: item.cpmk_code,
          lo_name: item.cpmk_name,
          status: item.cpmk_status,
        });
      }
      return {
        count: result?.total,
        datetime: moment().unix(),
        cpmk: newResult,
      };
    } catch (error) {
      console.log("err:_modifyCpmkGetResult", error);
      return result;
    }
  }

  /**
   * ==========================
   * Post Cpmk
   *
   * _validateBeforePostCpmk
   * ==========================
   */
  hook.addFilter( `${appPrefix}_validate_post_${cpmkPrefix}`, appPrefix, _validateBeforePostCpmk, 10, 2 ) // prettier-ignore
  hook.addFilter(`${appPrefix}_${cpmkPrefix}_post_result`, appPrefix, _modifyCpmkPostResult, 10); // prettier-ignore

  /**
   * Validasi body data
   *
   * @param {*} res
   * @param {*} query
   * @returns
   */
  async function _validateBeforePostCpmk(res, query) {
    try {
      const { rps_id, code, name, clo_ids } = query;

      if (_.isNil(rps_id) || _.eq(rps_id, "")) return `rps_id required`;
      if (_.isNil(code) || _.eq(code, "")) return `code required`;
      if (_.isNil(name) || _.eq(name, "")) return `name required`;
      if (_.isNil(clo_ids) || _.isEmpty(clo_ids)) return `clo_ids required`;

      // validate type is ObjectId
      if (!isValidObjectId(rps_id)) return "rps_id not valid";

      // validate is rps exist
      const isRpsExist = await c_rps._getRpsById(rps_id);
      if (_.isNil(isRpsExist)) return "RPS tidak ditemukan";

      return res;
    } catch (error) {
      console.log("err: _validateBeforePostCpmk", error);
      return res;
    }
  }

  /**
   * modify / format ulang data yang muncul di user
   *
   * @param {*} result
   */
  async function _modifyCpmkPostResult(result) {
    try {
      return {
        status: "success",
        message: "berhasil menambah data cpmk",
        datetime: moment().unix(),
        id: result._id,
      };
    } catch (error) {
      console.log("err:_modifyCpmkPostResult", error);
      return result;
    }
  }

  /**
   * ==========================
   * put Cpmk
   *
   * _validateBeforeputCpmk
   * ==========================
   */
  hook.addFilter(`${appPrefix}_${cpmkPrefix}_put_result`, appPrefix, _modifyCpmkPutResult, 10); // prettier-ignore

  /**
   * modify / format ulang data yang muncul di user
   *
   * @param {*} result
   */
  async function _modifyCpmkPutResult(result) {
    try {
      return {
        status: "success",
        message: "berhasil merubah data cpmk",
        datetime: moment().unix(),
        id: result._id,
      };
    } catch (error) {
      console.log("err:_modifyCpmkGetResult", error);
      return result;
    }
  }

  /**
   * ==========================
   * Delete Cpmk
   *
   * _validateBeforeDeleteCpmk
   * ==========================
   */
  hook.addFilter(`${appPrefix}_validate_delete_${cpmkPrefix}`, appPrefix, _validateBeforeDeleteCpmk, 10, 2); // prettier-ignore
  hook.addFilter(`${appPrefix}_${cpmkPrefix}_delete_result`, appPrefix, _modifyCpmkDeleteResult, 10); // prettier-ignore

  /**
   * Validasi body data
   *
   * @param {*} resolve
   * @param {*} query
   * @returns
   */
  async function _validateBeforeDeleteCpmk(res, query) {
    try {
      const { cpmk_id, rps_id } = query;
      // check is rps_id not empty
      if (_.isNil(rps_id) || _.eq(rps_id, "")) return `rps_id required`;

      // check is cpmk_id not empty
      if (_.isNil(cpmk_id) || _.eq(cpmk_id, "")) return `cpmk_id required`;

      // validate type is ObjectId
      if (!isValidObjectId(rps_id)) return "rps_id not valid";
      if (!isValidObjectId(cpmk_id)) return "cpmk_id not valid";

      return res;
    } catch (error) {
      _e("err: _validateBeforeDeleteCpmk", error);
      return error.message;
    }
  }

  /**
   * modify / format ulang data yang muncul di user
   *
   * @param {*} result
   */
  async function _modifyCpmkDeleteResult(result) {
    try {
      return {
        status: "success",
        message: "berhasil menghapus data cpmk",
        datetime: moment().unix(),
        id: result._id,
      };
    } catch (error) {
      console.log("err:_modifyCpmkDeleteResult", error);
      return result;
    }
  }
};
