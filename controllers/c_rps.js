const m_rps = require("../models/m_rps");

class ControllerRps {
  constructor(params) {
    this.state = params;
  }

  /**
   * Get rps By rps Id
   *
   * @param   {[type]}  rpsId  [rpsId description]
   *
   * @return  {[type]}           [return description]
   */
  _getRpsById(rpsId) {
    return new Promise(async (resolve, reject) => {
      try {
        /**
         * add hook validate get detail rps
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_get_detail_${rpsPrefix}`, "", rpsId); //prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before get detail rps
         */
        hook.doAction(`${appPrefix}_before_get_detail_${rpsPrefix}`, rpsId, resolve); //prettier-ignore

        /**
         * get mongodb data by id
         */
        const result = await m_rps
          .findById(rpsId)
          .populate({ path: "rps_creator" })
          .populate({ path: "rps_validator" });

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${rpsPrefix}_detail_result`, result); //prettier-ignore

        resolve(newResult);
        return;
      } catch (error) {
        console.log("err:_getRpsById", error);
        reject(error.message);
      }
    });
  }

  /**
   * get all rps by filter
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _getRps(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const skip = query?.skip || 0,
          limit = query?.limit || env.LIMIT,
          sort = query?.sort || "-_id";

        /**
         * add hook validate get rps
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_get_${rpsPrefix}`, "", query); //prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before get rps
         */
        hook.doAction(`${appPrefix}_before_get_${rpsPrefix}`, query, resolve); //prettier-ignore

        /**
         * add hook modify rps query
         *
         */
        let newQuery = await hook.applyFilters(`${appPrefix}_${rpsPrefix}_query`, query); //prettier-ignore

        /**
         * get mongodb total data by query
         */
        const countResult = await m_rps.countDocuments(newQuery);

        /**
         * get mongodb data by query
         */
        const result = await m_rps
          .find(newQuery, null, { skip, limit, sort })
          .lean()
          .populate({ path: "rps_creator" })
          .populate({ path: "rps_validator" });

        /**
         * add hook after get rps
         */
        hook.doAction(`${appPrefix}_after_get_${rpsPrefix}`, {total: countResult, data: result}, newQuery); //prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${rpsPrefix}_get_result`, {total: countResult, data: result}, newQuery); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_getRps", error);
        return reject(error);
      }
    });
  }

  /**
   * add new rps
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _postRps(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          code,
          name,
          credit,
          semester,
          rev,
          status,
          editable,
          creator,
          validator,
        } = query;

        /**
         * add hook validate post rps
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_post_${rpsPrefix}`, "", query); // prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before post rps
         *
         */
        await hook.doAction(`${appPrefix}_before_post_${rpsPrefix}`, query, resolve); // prettier-ignore

        /**
         * add hook modify rps params
         *
         */
        let newparams = await hook.applyFilters(`${appPrefix}_${rpsPrefix}_post_params`, {
          rps_code: code || "",
          rps_name: name || "",
          rps_credit: credit || 0,
          rps_semester: semester || 0,
          rps_rev: rev || 0,
          rps_editable: editable || false,
          rps_status: status || "active",
          rps_creator: creator || "",
        }, query); //prettier-ignore

        /**
         * add data into mongodb
         */
        let rps = await m_rps.create(newparams);

        /**
         * add hook after post rps
         *
         */
        await hook.doAction(`${appPrefix}_after_post_${rpsPrefix}`, rps, query); // prettier-ignore

        resolve(rps);
      } catch (error) {
        console.log("err:_postRps", error);
        resolve(error);
      }
    });
  }
  /**
   * update rps
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _putRps(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          rps_id,
          validate_at,
          code,
          name,
          credit,
          semester,
          rev,
          editable,
          desc,
          materi,
          creator,
          validator,
          status,
        } = query;

        /**
         * add hook validate put ${rpsPrefix}
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_put_${rpsPrefix}`, "", query); // prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before put ${rpsPrefix}
         *
         */
        hook.doAction(`${appPrefix}_before_put_${rpsPrefix}`, query, resolve);

        let result = await m_rps.findOneAndUpdate(
          {
            _id: rps_id,
          },
          {
            ...(validate_at && { rps_validate_at: validate_at }),
            ...(code && { rps_code: code }),
            ...(name && { rps_name: name }),
            ...(credit && { rps_credit: credit }),
            ...(semester && { rps_semester: semester }),
            ...(rev && { rps_rev: rev }),
            ...(editable && { rps_editable: editable }),
            ...(desc && { rps_desc: desc }),
            ...(materi && { rps_materi: materi }),
            ...(creator && { rps_creator: creator }),
            ...(validator && { rps_validator: validator }),
            ...(status && { rps_status: status }),
          }
        );

        /**
         * check if mongodb return null
         */
        if (_.isNil(result)) return resolve(`${rpsPrefix} not found`);

        /**
         * add hook after put ${rpsPrefix}
         */
        hook.doAction(`${appPrefix}_after_put_${rpsPrefix}`, result, query);

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${rpsPrefix}_put_result`, result, query); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_putRps", error);
        resolve(error);
      }
    });
  }

  /**
   * delete rps by rps id
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}          [return description]
   */
  _deleteRps(query) {
    return new Promise(async (resolve, reject) => {
      try {
        let result = "";

        /**
         * add hook validate delete rps
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_delete_${rpsPrefix}`, "", query); //prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before delete rps
         *
         */
        await hook.doAction(`${appPrefix}_before_delete_${rpsPrefix}`, query); //prettier-ignore

        /**
         * Delete permanent from mongodb if
         * have params force == "true"
         * else only change rps status to deleted
         */
        if (!_.isNil(query.force) && _.eq(query.force, "true")) {
          result = await m_rps.deleteOne({ _id: query.rps_id });
        } else {
          result = await m_rps.findOneAndUpdate(
            { _id: query.rps_id },
            { rps_status: "deleted" }
          );
        }

        /**
         * add hook after delete rps
         *
         */
        await hook.doAction(`${appPrefix}_after_delete_${rpsPrefix}`, result, query); //prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${rpsPrefix}_delete_result`, result, query); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_deleteRps", error);
        resolve(error);
      }
    });
  }
}

module.exports = ControllerRps;
