const ControllerRefs = require("../controllers/c_refs");
const ControllerRps = require("../controllers/c_rps");
const { isValidObjectId } = require("../utils/u_helpers");

module.exports = (params) => {
  const c_refs = new ControllerRefs(params);
  const c_rps = new ControllerRps(params);

  /**
   * ==========================
   * Get refs
   *
   * _getrefsFilterQuery
   * ==========================
   */
  hook.addFilter(`${appPrefix}_${refsPrefix}_query`, appPrefix, _getRefsFilterQuery, 10); // prettier-ignore
  hook.addFilter(`${appPrefix}_${refsPrefix}_get_result`, appPrefix, _modifyRefsGetResult, 10, 2); // prettier-ignore

  /**
   * modify query get refs
   *
   * @param {*} query
   */
  async function _getRefsFilterQuery(query) {
    try {
      // filter by rps id
      if (!_.isNil(query?.rps_id)) {
        query.refs_rps_id = query?.rps_id;
        delete query.rps_id;
      }

      // filter by status
      if (!_.isNil(query?.status)) {
        query.refs_status = query?.status;
        delete query.status;
      }
      // filter by author
      if (!_.isNil(query?.author)) {
        query.refs_author = query?.author;
        delete query.author;
      }
      // filter by publisher
      if (!_.isNil(query?.publisher)) {
        query.refs_publisher = query?.publisher;
        delete query.publisher;
      }
      // filter by year
      if (!_.isNil(query?.year)) {
        query.refs_year = query?.year;
        delete query.year;
      }
      // filter by category
      if (!_.isNil(query?.category)) {
        query.refs_category = query?.category;
        delete query.category;
      }

      return query || {};
    } catch (error) {
      console.log("err: _getRefsFilterQuery", error);
      return query;
    }
  }

  /**
   * modify / format ulang data yang muncul di user
   *
   * @param {*} result
   */
  async function _modifyRefsGetResult(result, query) {
    try {
      if (_.isEmpty(result?.data)) return result;
      let newResult = [];
      for (let index = 0; index < result?.data.length; index++) {
        const item = result?.data[index];

        let params = { id: item._id };

        // pilih key yang ingin ditampilkan
        if (!_.isNil(query?.select)) {
          const splitSelect = _.split(query?.select, ",");
          for (let index = 0; index < splitSelect.length; index++) {
            const select = splitSelect[index];
            params[select] = item[`refs_${select}`];
          }
          console.log("params", splitSelect, params);
        } else {
          params = {
            ...params,
            category: item.refs_category,
            name: item.refs_title,
            author: item.refs_author,
            publisher: item.refs_publisher,
            year: item.refs_year,
            description: item.refs_description,
            category: item.refs_category,
            status: item.refs_status,
          };
        }

        newResult.push(params);
      }
      return {
        count: result?.total,
        datetime: moment().unix(),
        refs: newResult,
      };
    } catch (error) {
      console.log("err:_modifyRefsGetResult", error);
      return result;
    }
  }

  /**
   * ==========================
   * Post Refs
   *
   * _validateBeforePostRefs
   * ==========================
   */
  hook.addFilter( `${appPrefix}_validate_post_${refsPrefix}`, appPrefix, _validateBeforePostRefs, 10, 2 ) // prettier-ignore
  hook.addFilter(`${appPrefix}_${refsPrefix}_post_result`, appPrefix, _modifyRefsPostResult, 10); // prettier-ignore

  /**
   * Validasi body data
   *
   * @param {*} res
   * @param {*} query
   * @returns
   */
  async function _validateBeforePostRefs(res, query) {
    try {
      const { rps_id, title, author, publisher, year, category, description } =
        query;

      if (_.isNil(rps_id) || _.eq(rps_id, "")) return `rps_id required`;
      if (_.isNil(title) || _.eq(title, "")) return `title required`;
      if (_.isNil(author) || _.eq(author, "")) return `author required`;
      if (_.isNil(publisher) || _.eq(publisher, ""))
        return `publisher required`;
      if (_.isNil(year) || _.eq(year, "")) return `year required`;
      if (_.isNil(category) || _.eq(category, "")) return `category required`;
      if (_.isNil(description) || _.eq(description, ""))
        return `description required`;

      // validate type is ObjectId
      if (!isValidObjectId(rps_id)) return "rps_id not valid";

      // validate is rps exist
      const isRpsExist = await c_rps._getRpsById(rps_id);
      if (_.isNil(isRpsExist)) return "RPS tidak ditemukan";

      return res;
    } catch (error) {
      console.log("err: _validateBeforePostRefs", error);
      return res;
    }
  }

  /**
   * modify / format ulang data yang muncul di user
   *
   * @param {*} result
   */
  async function _modifyRefsPostResult(result) {
    try {
      return {
        status: "success",
        message: "berhasil menambah data refs",
        datetime: moment().unix(),
        id: result._id,
      };
    } catch (error) {
      console.log("err:_modifyRefsPostResult", error);
      return result;
    }
  }

  /**
   * ==========================
   * put Refs
   *
   * _validateBeforeputRefs
   * ==========================
   */
  hook.addFilter(`${appPrefix}_${refsPrefix}_put_result`, appPrefix, _modifyRefsPutResult, 10); // prettier-ignore

  /**
   * modify / format ulang data yang muncul di user
   *
   * @param {*} result
   */
  async function _modifyRefsPutResult(result) {
    try {
      return {
        status: "success",
        message: "berhasil merubah data refs",
        datetime: moment().unix(),
        id: result._id,
      };
    } catch (error) {
      console.log("err:_modifyRefsGetResult", error);
      return result;
    }
  }

  /**
   * ==========================
   * Delete Refs
   *
   * _validateBeforeDeleteRefs
   * ==========================
   */
  hook.addFilter(`${appPrefix}_validate_delete_${refsPrefix}`, appPrefix, _validateBeforeDeleteRefs, 10, 2); // prettier-ignore
  hook.addFilter(`${appPrefix}_${refsPrefix}_delete_result`, appPrefix, _modifyRefsDeleteResult, 10); // prettier-ignore

  /**
   * Validasi body data
   *
   * @param {*} resolve
   * @param {*} query
   * @returns
   */
  async function _validateBeforeDeleteRefs(res, query) {
    try {
      const { refs_id, rps_id } = query;
      // check is rps_id not empty
      if (_.isNil(rps_id) || _.eq(rps_id, "")) return `rps_id required`;

      // check is refs_id not empty
      if (_.isNil(refs_id) || _.eq(refs_id, "")) return `refs_id required`;

      // validate type is ObjectId
      if (!isValidObjectId(rps_id)) return "rps_id not valid";
      if (!isValidObjectId(refs_id)) return "refs_id not valid";

      return res;
    } catch (error) {
      console.log("err: _validateBeforeDeleteRefs", error);
      return error.message;
    }
  }

  /**
   * modify / format ulang data yang muncul di user
   *
   * @param {*} result
   */
  async function _modifyRefsDeleteResult(result) {
    try {
      return {
        status: "success",
        message: "berhasil menghapus data refs",
        datetime: moment().unix(),
        id: result._id,
      };
    } catch (error) {
      console.log("err:_modifyRefsDeleteResult", error);
      return result;
    }
  }
};
