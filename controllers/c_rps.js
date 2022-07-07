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
        resolve(this._getRps({ rps_id: rpsId }));
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
        console.log("query", query);
        /**
         * add hook validate get rpss
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
         * get mongodb data by query
         */
        const result = await m_rps.find(newQuery).lean();

        /**
         * add hook after get rps
         */
        hook.doAction(`${appPrefix}_after_get_${rpsPrefix}`, result, newQuery); //prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${rpsPrefix}_result`, result); //prettier-ignore

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
        const { code, name, credit, semester, rev, status, editable } = query;

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
         * add data into mongodb
         */
        let rps = await m_rps.create({
          rps_code: code || "",
          rps_name: name || "",
          rps_credit: credit || 0,
          rps_semester: semester || 0,
          rps_rev: rev || 0,
          rps_editable: editable || false,
          rps_status: status || "active",
        });

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
}

module.exports = ControllerRps;
