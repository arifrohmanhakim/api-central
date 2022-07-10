const m_lecturers = require("../models/m_lecturers");
class ControllerLecturers {
  constructor(params) {
    this.state = params;
  }

  /**
   * Get lecturers By Lecturer Id
   *
   * @param   {[type]}  lecturerId  [lecturerId description]
   *
   * @return  {[type]}           [return description]
   */
  _getLecturersById(lecturerId) {
    return new Promise(async (resolve, reject) => {
      try {
        resolve(this._getLecturers({ l_id: lecturerId }));
        return;
      } catch (error) {
        console.log("err:_getLecturersById", error);
        reject(error.message);
      }
    });
  }

  /**
   * get all lecturers by filter
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _getLecturers(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const skip = query?.skip || 0,
          limit = query?.limit || env.LIMIT,
          sort = query?.sort || "-_id";

        /**
         * add hook validate get users
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_get_${lecturersPrefix}`, "", query); //prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before get lecturers
         *
         */
        hook.doAction(`${appPrefix}_before_get_${lecturersPrefix}`, query, resolve); //prettier-ignore

        /**
         * add hook modify lecturers query
         *
         */
        let newQuery = await hook.applyFilters(`${appPrefix}_${lecturersPrefix}_query`, query); //prettier-ignore

        /**
         * get mongodb total data by query
         */
        const countResult = await m_lecturers.countDocuments(newQuery);

        /**
         * get elastic data by query
         */
        const result = await m_lecturers
          .find(newQuery, null, { skip, limit, sort })
          .lean()
          .populate({ path: "l_user_id" })
          .populate({ path: "l_rps_id" });

        /**
         * add hook after get users
         *
         * _insertLogGetUserById 10
         */
        hook.doAction(`${appPrefix}_after_get_${lecturersPrefix}`, {total: countResult, data: result}, newQuery); //prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${lecturersPrefix}_result`, {total: countResult, data: result}); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_getLecturers", error);
        return reject(error);
      }
    });
  }

  /**
   * add new lecturers
   *
   * @param   {[type]}  query  [query description]
   * lecturer_id - dosen pengampu (user)
   *
   * @return  {[type]}         [return description]
   */
  _postLecturers(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const { rps_id, lecturer_id, status } = query;

        /**
         * add hook validate post lecturers
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_post_${lecturersPrefix}`, "", query); // prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before post lecturers
         *
         */
        await hook.doAction(`${appPrefix}_before_post_${lecturersPrefix}`, query, resolve); // prettier-ignore

        /**
         * add data into mongodb
         */
        let result = await m_lecturers.create({
          l_rps_id: rps_id || "",
          l_user_id: lecturer_id || "",
          l_status: status || "active",
        });

        /**
         * add hook after post lecturers
         *
         */
        await hook.doAction(`${appPrefix}_after_post_${lecturersPrefix}`, result, query); // prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${lecturersPrefix}_post_result`, result); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_postLecturers", error);
        resolve(error);
      }
    });
  }

  /**
   * update lecturers
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _putLecturers(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          lecturers_id,
          rps_id,
          lecturer_id, // user id
          status,
        } = query;

        /**
         * add hook validate put ${lecturersPrefix}
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_put_${lecturersPrefix}`, "", query); // prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before put ${lecturersPrefix}
         *
         */
        hook.doAction(
          `${appPrefix}_before_put_${lecturersPrefix}`,
          query,
          resolve
        );

        let result = await m_lecturers.findOneAndUpdate(
          {
            _id: lecturers_id,
          },
          {
            ...(lecturer_id && { l_user_id: lecturer_id }),
            ...(status && { l_status: status }),
          }
        );

        /**
         * check if mongodb return null
         */
        if (_.isNil(result)) return resolve(`${lecturersPrefix} not found`);

        /**
         * add hook after put ${lecturersPrefix}
         */
        hook.doAction(
          `${appPrefix}_after_put_${lecturersPrefix}`,
          result,
          query
        );

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${lecturersPrefix}_put_result`, result); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_putLecturers", error);
        resolve(error);
      }
    });
  }

  /**
   * delete lecturers by lecturers id
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}          [return description]
   */
  _deleteLecturers(query) {
    return new Promise(async (resolve, reject) => {
      try {
        let results = "";

        /**
         * add hook validate delete lecturers
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_delete_${lecturersPrefix}`, "", query); //prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before delete lecturers
         *
         */
        await hook.doAction(`${appPrefix}_before_delete_${lecturersPrefix}`, query); //prettier-ignore

        /**
         * Delete permanent from mongodb if
         * have params force == "true"
         * else only change lecturers status to deleted
         */
        if (!_.isNil(query.force) && _.eq(query.force, "true")) {
          results = await m_lecturers.deleteOne({ _id: query.lecturers_id });
        } else {
          results = await m_lecturers.findOneAndUpdate(
            { _id: query.lecturers_id },
            { lecturers_status: "deleted" }
          );
        }

        /**
         * add hook after delete lecturers
         *
         */
        await hook.doAction(`${appPrefix}_after_delete_${lecturersPrefix}`, results, query); //prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${lecturersPrefix}_delete_result`, results); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        _e("err:_deleteLecturers", error);
        resolve(error);
      }
    });
  }
}

module.exports = ControllerLecturers;
