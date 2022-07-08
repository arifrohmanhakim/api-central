const ControllerCpmk = require("../controllers/c_cpmk");
const { isValidObjectId } = require("../utils/u_helpers");

module.exports = (params) => {
  const c_cpmk = new ControllerCpmk(params);

  /**
   * ==========================
   * Post Cpmk
   *
   * _validateBeforePostCpmk
   * ==========================
   */
  hook.addFilter( `${appPrefix}_validate_post_${cpmkPrefix}`, appPrefix, _validateBeforePostCpmk, 10, 2 ) // prettier-ignore
  hook.addFilter(`${appPrefix}_${cpmkPrefix}_get_result`, appPrefix, _modifyCpmkGetResult, 10); // prettier-ignore

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
  async function _modifyCpmkGetResult(result) {
    try {
      if (_.isEmpty(result?.data)) return result;
      let newResult = [];
      for (let index = 0; index < result?.data.length; index++) {
        const item = result?.data[index];
        newResult.push({
          id: item._id,
          code: item.cpmk_code,
          lo_name: item.cpmk_name,
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
    console.log("pas", result);
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
};
