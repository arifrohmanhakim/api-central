const m_cpmk = require("../models/m_cpmk");
class ControllerCpmk {
  constructor(params) {
    this.state = params;
  }

  /**
   * get all cpmk by filter
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _getCpmk(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const skip = query?.skip || 0,
          limit = query?.limit || env.LIMIT,
          sort = query?.sort || "-_id";

        /**
         * add hook validate get users
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_get_${cpmkPrefix}`, "", query); //prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before get cpmk
         *
         */
        hook.doAction(`${appPrefix}_before_get_${cpmkPrefix}`, query, resolve); //prettier-ignore

        /**
         * add hook modify cpmk query
         *
         */
        let newQuery = await hook.applyFilters(`${appPrefix}_${cpmkPrefix}_query`, query); //prettier-ignore

        /**
         * get mongodb total data by query
         */
        const countResult = await m_cpmk.countDocuments(newQuery);

        /**
         * get elastic data by query
         */
        const result = await m_cpmk
          .find(newQuery, null, { skip, limit, sort })
          .lean()
          .populate({ path: "cpmk_rps_id" });

        /**
         * add hook after get users
         *
         * _insertLogGetUserById 10
         */
        hook.doAction(`${appPrefix}_after_get_${cpmkPrefix}`, {total: countResult, data: result}, newQuery); //prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${cpmkPrefix}_get_result`, {total: countResult, data: result}); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_getCpmk", error);
        return reject(error);
      }
    });
  }

  /**
   * add new cpmk
   *
   * @param   {[type]}  query  [query description]
   * lecturer_id - dosen pengampu (user)
   *
   * @return  {[type]}         [return description]
   */
  _postCpmk(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const { rps_id, code, name, clo_ids, status } = query;

        /**
         * add hook validate post cpmk
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_post_${cpmkPrefix}`, "", query); // prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before post cpmk
         *
         */
        await hook.doAction(`${appPrefix}_before_post_${cpmkPrefix}`, query, resolve); // prettier-ignore

        /**
         * add data into mongodb
         */
        let result = await m_cpmk.create({
          cpmk_rps_id: rps_id || "",
          cpmk_code: code || "",
          cpmk_name: name || "",
          cpmk_clo_ids: clo_ids || [],
          cpmk_status: status || "active",
        });

        /**
         * add hook after post cpmk
         *
         */
        await hook.doAction(`${appPrefix}_after_post_${cpmkPrefix}`, result, query); // prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${cpmkPrefix}_post_result`, result, query); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_postCpmk", error);
        resolve(error);
      }
    });
  }

  /**
   * update cpmk
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _putCpmk(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const { cpmk_id, rps_id, code, name, clo_ids, status } = query;

        /**
         * add hook validate put ${cpmkPrefix}
         *
         * _validateBeforePutUser 10
         * _validateUserPutExists 20
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_put_${cpmkPrefix}`, "", query); // prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before put ${cpmkPrefix}
         *
         */
        hook.doAction(`${appPrefix}_before_put_${cpmkPrefix}`, query, resolve);

        let result = await m_cpmk.findOneAndUpdate(
          {
            _id: cpmk_id,
          },
          {
            ...(code && { cpmk_code: code }),
            ...(name && { cpmk_name: name }),
            ...(clo_ids && { cpmk_clo_ids: clo_ids }),
            ...(status && { cpmk_status: status }),
          }
        );

        /**
         * check if mongodb return null
         */
        if (_.isNil(result)) return resolve(`${cpmkPrefix} not found`);

        /**
         * add hook after put ${cpmkPrefix}
         */
        hook.doAction(`${appPrefix}_after_put_${cpmkPrefix}`, result, query);

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${cpmkPrefix}_put_result`, result, query); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_putCpmk", error);
        resolve(error);
      }
    });
  }

  /**
   * delete cpmk by cpmk id
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}          [return description]
   */
  _deleteCpmk(query) {
    return new Promise(async (resolve, reject) => {
      try {
        let results = "";

        /**
         * add hook validate delete cpmk
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_delete_${cpmkPrefix}`, "", query); //prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before delete cpmk
         *
         */
        await hook.doAction(`${appPrefix}_before_delete_${cpmkPrefix}`, query); //prettier-ignore

        /**
         * Delete permanent from mongodb if
         * have params force == "true"
         * else only change cpmk status to deleted
         */
        if (!_.isNil(query.force) && _.eq(query.force, "true")) {
          results = await m_cpmk.deleteOne({ _id: query.cpmk_id });
        } else {
          results = await m_cpmk.findOneAndUpdate(
            { _id: query.cpmk_id },
            { cpmk_status: "deleted" }
          );
        }

        /**
         * add hook after delete cpmk
         *
         */
        await hook.doAction(`${appPrefix}_after_delete_${cpmkPrefix}`, results, query); //prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${cpmkPrefix}_delete_result`, result, querys); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        _e("err:_deleteCpmk", error);
        resolve(error);
      }
    });
  }
}

module.exports = ControllerCpmk;
