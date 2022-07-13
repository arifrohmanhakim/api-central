const ControllerMaster = require("../controllers/c_master");
const ControllerRps = require("../controllers/c_rps");
const { isValidObjectId } = require("../utils/u_helpers");

module.exports = (params) => {
  const c_master = new ControllerMaster(params);
  const c_rps = new ControllerRps(params);

  /**
   * ==========================
   * Get master By id
   * ==========================
   */
  hook.addFilter(`${appPrefix}_${masterPrefix}_detail_result`, appPrefix, _modifyMasterDetailGetResult, 10); // prettier-ignore

  /**
   * modify / format ulang data yang muncul di user
   *
   * @param {*} result
   */
  async function _modifyMasterDetailGetResult(result) {
    try {
      if (_.isNil(result)) return result;

      // get master meta
      const masterMeta = await c_master._getMasterMeta({
        master_id: result._id,
      });

      if (!_.isNil(masterMeta) && !_.isEmpty(masterMeta)) {
        for (let index = 0; index < masterMeta.length; index++) {
          const meta = masterMeta[index];
          result[meta.mm_key] = meta.mm_value;
        }
      }
      return result;
    } catch (error) {
      console.log("err:_modifyMasterDetailGetResult", error);
      return result;
    }
  }

  /**
   * ==========================
   * Get master
   *
   * _getmasterFilterQuery
   * ==========================
   */
  hook.addFilter(`${appPrefix}_${masterPrefix}_query`, appPrefix, _getMasterFilterQuery, 10); // prettier-ignore
  hook.addFilter(`${appPrefix}_${masterPrefix}_get_result`, appPrefix, _modifyMasterGetResult, 10, 2); // prettier-ignore

  /**
   * modify query get master
   *
   * @param {*} query
   */
  async function _getMasterFilterQuery(query) {
    try {
      // filter by status
      if (!_.isNil(query?.id)) {
        query._id = query?.id;
        delete query.id;
      }
      // filter by status
      if (!_.isNil(query?.status)) {
        query.master_status = query?.status;
        delete query.status;
      }
      // filter by author
      if (!_.isNil(query?.author)) {
        query.master_author = query?.author;
        delete query.author;
      }
      // filter by type
      if (!_.isNil(query?.type)) {
        query.master_type = query?.type;
        delete query.type;
      }
      // filter by parent
      if (!_.isNil(query?.parent)) {
        query.master_parent = query?.parent;
        delete query.parent;
      }
      // filter by title
      if (!_.isNil(query?.title)) {
        query.master_title = query?.title;
        delete query.title;
      }

      return query || {};
    } catch (error) {
      console.log("err: _getMasterFilterQuery", error);
      return query;
    }
  }

  /**
   * modify / format ulang data yang muncul di user
   *
   * @param {*} result
   */
  async function _modifyMasterGetResult(result, query) {
    try {
      if (_.isEmpty(result?.data)) return result;
      if (!_.isNil(query?.raw) && query?.raw) return result;
      let newResult = [];
      for (let index = 0; index < result?.data.length; index++) {
        const item = result?.data[index];

        let params = { id: item._id };

        // pilih key yang ingin ditampilkan
        if (!_.isNil(query?.select)) {
          const splitSelect = _.split(query?.select, ",");
          for (let index = 0; index < splitSelect.length; index++) {
            const select = splitSelect[index];
            params[select] = item[`master_${select}`];
          }
        } else {
          params = {
            ...params,
            title: item.master_title,
            content: item.master_content,
            author: item.master_author,
            type: item.master_type,
            status: item.master_status,
          };
        }
        // get master meta
        const masterMeta = await c_master._getMasterMeta({
          m_id: item._id,
        });

        if (!_.isNil(masterMeta) && !_.isEmpty(masterMeta)) {
          for (let index = 0; index < masterMeta.length; index++) {
            const meta = masterMeta[index];
            params[meta.mm_key] = meta.mm_value;
          }
        }

        newResult.push(params);
      }
      return {
        count: result?.total,
        datetime: moment().unix(),
        master: newResult,
      };
    } catch (error) {
      console.log("err:_modifyMasterGetResult", error);
      return result;
    }
  }

  /**
   * ==========================
   * Post Master
   *
   * _validateBeforePostMaster
   * ==========================
   */
  hook.addFilter( `${appPrefix}_validate_post_${masterPrefix}`, appPrefix, _validateBeforePostMaster, 10, 2 ) // prettier-ignore
  hook.addAction( `${appPrefix}_after_post_${masterPrefix}`, appPrefix, _insertMasterMeta, 10, 2 ) // prettier-ignore
  hook.addFilter(`${appPrefix}_${masterPrefix}_post_result`, appPrefix, _modifyMasterPostResult, 10); // prettier-ignore

  /**
   * Validasi body data
   *
   * @param {*} res
   * @param {*} query
   * @returns
   */
  async function _validateBeforePostMaster(res, query) {
    try {
      const { title, author, type } = query;

      if (_.isNil(title) || _.eq(title, "")) return `title required`;
      if (_.isNil(author) || _.eq(author, "")) return `author required`;
      if (_.isNil(type) || _.eq(type, "")) return `type required`;

      return res;
    } catch (error) {
      console.log("err: _validateBeforePostMaster", error);
      return res;
    }
  }

  /**
   * tambahkan master meta ke database
   *
   * @param   {[type]}  master   [master description]
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  async function _insertMasterMeta(master, query) {
    if (_.isNil(master._id)) return;
    if (_.isNil(query.mm_data)) return;

    c_master._postMasterMeta(master._id, query);
  }

  /**
   * modify / format ulang data yang muncul di user
   *
   * @param {*} result
   */
  async function _modifyMasterPostResult(result) {
    try {
      return {
        status: "success",
        message: "berhasil menambah data master",
        datetime: moment().unix(),
        id: result._id,
      };
    } catch (error) {
      console.log("err:_modifyMasterPostResult", error);
      return result;
    }
  }

  /**
   * ==========================
   * put Master
   *
   * _updateMasterMeta
   * _validateBeforeputMaster
   * ==========================
   */
  hook.addAction(`${appPrefix}_after_put_${masterPrefix}`, appPrefix, _updateMasterMeta, 10); // prettier-ignore
  hook.addFilter(`${appPrefix}_${masterPrefix}_put_result`, appPrefix, _modifyMasterPutResult, 10); // prettier-ignore

  /**
   * update master meta ke database
   *
   * @param   {[type]}  master   [master description]
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  async function _updateMasterMeta(master, query) {
    if (_.isNil(master._id)) return;
    if (_.isNil(query.type)) return;
    if (_.isNil(query.mm_data)) return;
    return await c_master._putMasterMeta(master._id, query);
  }

  /**
   * modify / format ulang data yang muncul di user
   *
   * @param {*} result
   */
  async function _modifyMasterPutResult(result) {
    try {
      return {
        status: "success",
        message: "berhasil merubah data master",
        datetime: moment().unix(),
        id: result._id,
      };
    } catch (error) {
      console.log("err:_modifyMasterGetResult", error);
      return result;
    }
  }

  /**
   * ==========================
   * Delete Master
   *
   * _validateBeforeDeleteMaster
   * _deleteMasterMeta
   * ==========================
   */
  hook.addFilter(`${appPrefix}_validate_delete_${masterPrefix}`, appPrefix, _validateBeforeDeleteMaster, 10, 2); // prettier-ignore
  hook.addAction(`${appPrefix}_after_delete_${masterPrefix}`, appPrefix, _deleteMasterMeta, 10, 2); // prettier-ignore
  hook.addFilter(`${appPrefix}_${masterPrefix}_delete_result`, appPrefix, _modifyMasterDeleteResult, 10); // prettier-ignore

  /**
   * Validasi body data
   *
   * @param {*} resolve
   * @param {*} query
   * @returns
   */
  async function _validateBeforeDeleteMaster(res, query) {
    try {
      const { master_id } = query;
      // check is master_id not empty
      if (_.isNil(master_id) || _.eq(master_id, ""))
        return `master_id required`;

      // validate type is ObjectId
      if (!isValidObjectId(master_id)) return "master_id not valid";

      return res;
    } catch (error) {
      console.log("err: _validateBeforeDeleteMaster", error);
      return error.message;
    }
  }

  /**
   * delete semua master meta jika force true
   *
   * @param   {[type]}  masterId  [masterId description]
   * @param   {[type]}  query   [query description]
   *
   * @return  {[type]}          [return description]
   */
  async function _deleteMasterMeta(result, query) {
    try {
      if (_.isNil(result.deletedCount)) return;
      if (_.eq(result.deletedCount, 0)) return;
      c_master._deleteMasterMeta(query.master_id);
    } catch (error) {
      console.log("err: _deleteMasterMeta", error);
    }
  }

  /**
   * modify / format ulang data yang muncul di user
   *
   * @param {*} result
   */
  async function _modifyMasterDeleteResult(result) {
    try {
      return {
        status: "success",
        message: "berhasil menghapus data master",
        datetime: moment().unix(),
        id: result._id,
      };
    } catch (error) {
      console.log("err:_modifyMasterDeleteResult", error);
      return result;
    }
  }
};
