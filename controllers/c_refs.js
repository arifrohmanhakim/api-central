const m_refs = require("../models/m_refs");
class ControllerRefs {
  constructor(params) {
    this.state = params;
  }

  /**
   * get all refs by filter
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _getRefs(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const skip = query?.skip || 0,
          limit = query?.limit || env.LIMIT,
          sort = query?.sort || "-_id";

        /**
         * add hook validate get users
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_get_${refsPrefix}`, "", query); //prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before get refs
         *
         */
        hook.doAction(`${appPrefix}_before_get_${refsPrefix}`, query, resolve); //prettier-ignore

        /**
         * add hook modify refs query
         *
         */
        let newQuery = await hook.applyFilters(`${appPrefix}_${refsPrefix}_query`, query); //prettier-ignore

        /**
         * get mongodb total data by query
         */
        const countResult = await m_refs.countDocuments(newQuery);

        /**
         * get elastic data by query
         */
        const result = await m_refs
          .find(newQuery, null, { skip, limit, sort })
          .lean()
          .populate({ path: "refs_rps_id" });

        /**
         * add hook after get refs
         */
        hook.doAction(`${appPrefix}_after_get_${refsPrefix}`, {total: countResult, data: result}, newQuery); //prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${refsPrefix}_get_result`, {total: countResult, data: result}, newQuery); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_getRefs", error);
        return reject(error);
      }
    });
  }

  /**
   * add new refs
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _postRefs(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          rps_id,
          title,
          author,
          publisher,
          year,
          description,
          category,
          status,
        } = query;

        /**
         * add hook validate post refs
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_post_${refsPrefix}`, "", query); // prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before post refs
         *
         */
        await hook.doAction(`${appPrefix}_before_post_${refsPrefix}`, query, resolve); // prettier-ignore

        /**
         * add data into mongodb
         */
        let result = await m_refs.create({
          refs_rps_id: rps_id || "",
          refs_title: title || "",
          refs_author: author || "",
          refs_publisher: publisher || "",
          refs_year: year || 0,
          refs_description: description || "",
          refs_category: category || "",
          refs_status: status || "active",
        });

        /**
         * add hook after post refs
         *
         */
        await hook.doAction(`${appPrefix}_after_post_${refsPrefix}`, result, query); // prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${refsPrefix}_post_result`, result, query); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_postRefs", error);
        resolve(error);
      }
    });
  }

  /**
   * update refs
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _putRefs(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          refs_id,
          rps_id,
          title,
          author,
          publisher,
          year,
          description,
          category,
          status,
        } = query;

        /**
         * add hook validate put ${refsPrefix}
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_put_${refsPrefix}`, "", query); // prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before put ${refsPrefix}
         *
         */
        hook.doAction(`${appPrefix}_before_put_${refsPrefix}`, query, resolve);

        let result = await m_refs.findOneAndUpdate(
          {
            _id: refs_id,
          },
          {
            ...(title && { refs_title: title }),
            ...(author && { refs_author: author }),
            ...(publisher && { refs_publisher: publisher }),
            ...(year && { refs_year: year }),
            ...(description && { refs_description: description }),
            ...(category && { refs_category: category }),
            ...(status && { refs_status: status }),
          }
        );

        /**
         * check if mongodb return null
         */
        if (_.isNil(result)) return resolve(`${refsPrefix} not found`);

        /**
         * add hook after put ${refsPrefix}
         */
        hook.doAction(`${appPrefix}_after_put_${refsPrefix}`, result, query);

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${refsPrefix}_put_result`, result, query); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_putRefs", error);
        resolve(error);
      }
    });
  }

  /**
   * delete refs by refs id
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}          [return description]
   */
  _deleteRefs(query) {
    return new Promise(async (resolve, reject) => {
      try {
        let results = "";

        /**
         * add hook validate delete refs
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_delete_${refsPrefix}`, "", query); //prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before delete refs
         *
         */
        await hook.doAction(`${appPrefix}_before_delete_${refsPrefix}`, query); //prettier-ignore

        /**
         * Delete permanent from mongodb if
         * have params force == "true"
         * else only change refs status to deleted
         */
        if (!_.isNil(query.force) && _.eq(query.force, "true")) {
          results = await m_refs.deleteOne({ _id: query.refs_id });
        } else {
          results = await m_refs.findOneAndUpdate(
            { _id: query.refs_id },
            { refs_status: "deleted" }
          );
        }

        /**
         * add hook after delete refs
         *
         */
        await hook.doAction(`${appPrefix}_after_delete_${refsPrefix}`, results, query); //prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${refsPrefix}_delete_result`, result, querys); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        _e("err:_deleteRefs", error);
        resolve(error);
      }
    });
  }
}

module.exports = ControllerRefs;
