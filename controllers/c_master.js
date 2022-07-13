const m_master = require("../models/m_master");
const m_master_meta = require("../models/m_master_meta");
class ControllerMaster {
  constructor(params) {
    this.state = params;
  }

  /**
   * Get master By master Id
   *
   * @param   {[type]}  masterId  [masterId description]
   *
   * @return  {[type]}           [return description]
   */
  _getMasterById(masterId) {
    return new Promise(async (resolve, reject) => {
      try {
        /**
         * add hook validate get detail master
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_get_detail_${masterPrefix}`, "", masterId); //prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before get detail master
         */
        hook.doAction(`${appPrefix}_before_get_detail_${masterPrefix}`, masterId, resolve); //prettier-ignore

        /**
         * get mongodb data by id
         */
        const result = await m_master.findById(masterId);

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${masterPrefix}_detail_result`, result); //prettier-ignore
        console.log("newResult", newResult);
        resolve(newResult);
        return;
      } catch (error) {
        console.log("err:_getMasterById", error);
        reject(error.message);
      }
    });
  }

  /**
   * get all master by filter
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _getMaster(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const skip = query?.skip || 0,
          limit = query?.limit || env.LIMIT,
          sort = query?.sort || "-_id";

        /**
         * add hook validate get masters
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_get_${masterPrefix}`, "", query); //prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before get master
         *
         */
        hook.doAction(`${appPrefix}_before_get_${masterPrefix}`, query, resolve); //prettier-ignore

        /**
         * add hook modify master query
         *
         */
        let newQuery = await hook.applyFilters(`${appPrefix}_${masterPrefix}_query`, query); //prettier-ignore

        /**
         * get mongodb total data by query
         */
        const countResult = await m_master.countDocuments(newQuery);

        /**
         * get elastic data by query
         */
        const result = await m_master
          .find(newQuery, null, { skip, limit, sort })
          .lean();

        /**
         * add hook after get master
         */
        hook.doAction(`${appPrefix}_after_get_${masterPrefix}`, {total: countResult, data: result}, newQuery); //prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${masterPrefix}_get_result`, {total: countResult, data: result}, newQuery); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_getMaster", error);
        return reject(error);
      }
    });
  }

  /**
   * get master Meta by filter
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _getMasterMeta(query) {
    return new Promise(async (resolve, reject) => {
      try {
        if (_.isNil(query?.m_id)) return "master_id required";
        /**
         * get mongodb data by query
         */
        const result = await m_master_meta.find(query).lean();
        resolve(result);
      } catch (error) {
        console.log("err:_getMasterMeta", error);
        return reject(error);
      }
    });
  }

  /**
   * add new master
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _postMaster(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const { title, content, author, type, parent, status } = query;

        /**
         * add hook validate post master
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_post_${masterPrefix}`, "", query); // prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before post master
         *
         */
        await hook.doAction(`${appPrefix}_before_post_${masterPrefix}`, query, resolve); // prettier-ignore

        /**
         * add data into mongodb
         */
        let result = await m_master.create({
          master_title: title || "",
          master_content: content || "",
          master_author: author || "",
          master_type: type || "",
          master_parent: parent || "",
          master_status: status || "active",
        });

        /**
         * add hook after post master
         *
         */
        await hook.doAction(`${appPrefix}_after_post_${masterPrefix}`, result, query); // prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${masterPrefix}_post_result`, result, query); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_postMaster", error);
        resolve(error);
      }
    });
  }

  /**
   * add new master meta
   *
   * @param   {[objectId]}  masterId  [query description]
   * @param   {[string]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _postMasterMeta(masterId, query) {
    return new Promise(async (resolve, reject) => {
      try {
        const { mm_data } = query;

        /**
         * add hook before post master meta
         */
        hook.doAction(`${appPrefix}_before_post_${masterPrefix}_meta`, masterId, query) // prettier-ignore

        let meta_data = [];
        _.forEach(mm_data, (val, key) =>
          meta_data.push({
            m_id: masterId,
            mm_key: key,
            mm_value: val,
          })
        );

        // insert into mongodb
        let master_meta = await m_master_meta.create(meta_data);

        /**
         * add hook after post master meta
         */
        hook.doAction(`${appPrefix}_after_post_${masterPrefix}_meta`, master_meta, masterId, query) // prettier-ignore

        resolve(master_meta);
      } catch (error) {
        console.log("err:_postMasterMeta", error);
        resolve(new Error(_.toString(error)));
      }
    });
  }

  /**
   * update master
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _putMaster(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const { master_id, title, content, author, type, parent, status } =
          query;

        /**
         * add hook validate put ${masterPrefix}
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_put_${masterPrefix}`, "", query); // prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before put ${masterPrefix}
         *
         */
        hook.doAction(`${appPrefix}_before_put_${masterPrefix}`, query, resolve ); // prettier-ignore

        let result = await m_master.findOneAndUpdate(
          {
            _id: master_id,
          },
          {
            ...(title && { master_title: title }),
            ...(content && { master_content: content }),
            ...(author && { master_author: author }),
            ...(type && { master_type: type }),
            ...(parent && { master_parent: parent }),
            ...(status && { master_status: status }),
          }
        );

        /**
         * check if mongodb return null
         */
        if (_.isNil(result)) return resolve(`${masterPrefix} not found`);

        /**
         * add hook after put ${masterPrefix}
         */
        hook.doAction(`${appPrefix}_after_put_${masterPrefix}`, result, query);

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${masterPrefix}_put_result`, result, query); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_putMaster", error);
        resolve(error);
      }
    });
  }

  /**
   * update master meta
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _putMasterMeta(masterId, query) {
    return new Promise(async (resolve, reject) => {
      try {
        const { mm_data } = query;
        let result = [];

        /**
         * add hook before put ${masterPrefix} meta
         */
        hook.doAction(
          `${appPrefix}_before_put_${masterPrefix}_meta`,
          masterId,
          query
        );

        _.forEach(mm_data, async (val, key) => {
          let status = await m_master_meta.findOneAndUpdate(
            {
              m_id: masterId,
              mm_key: key,
            },
            {
              mm_value: val,
            }
          );
          result.push(status);
        });

        /**
         * add hook after put ${masterPrefix} meta
         */
        hook.doAction(
          `${appPrefix}_after_put_${masterPrefix}_meta`,
          result,
          masterId,
          query
        );

        resolve(result);
      } catch (error) {
        console.log("err:_putMasterMeta", error);
        resolve(new Error(_.toString(error)));
      }
    });
  }

  /**
   * delete master by master id
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}          [return description]
   */
  _deleteMaster(query) {
    return new Promise(async (resolve, reject) => {
      try {
        let result = "";

        /**
         * add hook validate delete master
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_delete_${masterPrefix}`, "", query); //prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before delete master
         *
         */
        await hook.doAction(`${appPrefix}_before_delete_${masterPrefix}`, query); //prettier-ignore

        /**
         * Delete permanent from mongodb if
         * have params force == "true"
         * else only change master status to deleted
         */
        if (!_.isNil(query.force) && _.eq(query.force, "true")) {
          result = await m_master.deleteOne({ _id: query.master_id });
        } else {
          result = await m_master.findOneAndUpdate(
            { _id: query.master_id },
            { master_status: "deleted" }
          );
        }

        /**
         * add hook after delete master
         *
         */
        await hook.doAction(`${appPrefix}_after_delete_${masterPrefix}`, result, query); //prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${masterPrefix}_delete_result`, result, query); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_deleteMaster", error);
        resolve(error);
      }
    });
  }

  /**
   * delete master by master id
   *
   * @param   {[type]}  masterId  [masterId description]
   *
   * @return  {[type]}          [return description]
   */
  _deleteMasterMeta(masterId) {
    return new Promise(async (resolve, reject) => {
      try {
        /**
         * add hook before delete master meta
         *
         */
        await hook.doAction(
          `${AppPrefix}_before_delete_${masterPrefix}_meta`,
          masterId
        );

        let status = await m_master_meta.deleteMany({ m_id: masterId });
        resolve(status);
      } catch (error) {
        console.log("err:_deleteMasterMeta", error);
        resolve(new Error(_.toString(error)));
      }
    });
  }
}

module.exports = ControllerMaster;
