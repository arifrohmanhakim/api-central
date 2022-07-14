const m_session = require("../models/m_session");
class ControllerSession {
  constructor(params) {
    this.state = params;
  }

  /**
   * Get refs By refs Id
   *
   * @param   {[type]}  sessionId  [sessionId description]
   *
   * @return  {[type]}           [return description]
   */
  _getSessionById(sessionId) {
    return new Promise(async (resolve, reject) => {
      try {
        /**
         * add hook validate get detail session
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_get_detail_${sessionPrefix}`, "", sessionId); //prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before get detail session
         */
        hook.doAction(`${appPrefix}_before_get_detail_${sessionPrefix}`, sessionId, resolve); //prettier-ignore

        /**
         * get mongodb data by id
         */
        const result = await m_session.findById(sessionId);

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${sessionPrefix}_detail_result`, result); //prettier-ignore

        resolve(newResult);
        return;
      } catch (error) {
        console.log("err:_getSessionById", error);
        reject(error.message);
      }
    });
  }

  /**
   * get all session by filter
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _getSession(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const skip = query?.skip || 0,
          limit = query?.limit || env.LIMIT,
          sort = query?.sort || "-_id";

        /**
         * add hook validate get users
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_get_${sessionPrefix}`, "", query); //prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before get session
         *
         */
        hook.doAction(`${appPrefix}_before_get_${sessionPrefix}`, query, resolve); //prettier-ignore

        /**
         * add hook modify session query
         *
         */
        let newQuery = await hook.applyFilters(`${appPrefix}_${sessionPrefix}_query`, query); //prettier-ignore

        /**
         * get mongodb total data by query
         */
        const countResult = await m_session.countDocuments(newQuery);

        /**
         * get elastic data by query
         */
        const result = await m_session
          .find(newQuery, null, { skip, limit, sort })
          .lean()
          .populate({ path: "session_rps_id" });

        /**
         * add hook after get session
         */
        hook.doAction(`${appPrefix}_after_get_${sessionPrefix}`, {total: countResult, data: result}, newQuery); //prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${sessionPrefix}_get_result`, {total: countResult, data: result}, newQuery); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_getSession", error);
        return reject(error);
      }
    });
  }

  /**
   * add new session
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _postSession(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          rps_id,
          week_no,
          material,
          method,
          student_exp,
          los,
          assessments,
          refs,
          status,
        } = query;

        /**
         * add hook validate post session
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_post_${sessionPrefix}`, "", query); // prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before post session
         *
         */
        await hook.doAction(`${appPrefix}_before_post_${sessionPrefix}`, query, resolve); // prettier-ignore

        /**
         * add data into mongodb
         */
        let result = await m_session.create({
          session_rps_id: rps_id || "",
          session_week_no: week_no || 0,
          session_material: material || "",
          session_method: method || "",
          session_student_exp: student_exp || "",
          session_los: _.isString(los) ? los : JSON.stringify(los) || "[]",
          session_assessments: _.isString(assessments)
            ? assessments
            : JSON.stringify(assessments) || "[]",
          session_refs: _.isString(refs) ? refs : JSON.stringify(refs) || "[]",
          session_status: status || "active",
        });

        /**
         * add hook after post session
         *
         */
        await hook.doAction(`${appPrefix}_after_post_${sessionPrefix}`, result, query); // prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${sessionPrefix}_post_result`, result, query); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_postSession", error);
        resolve(error);
      }
    });
  }

  /**
   * update session
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _putSession(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          session_id,
          rps_id,
          week_no,
          material,
          method,
          student_exp,
          los,
          assessments,
          refs,
          status,
        } = query;

        /**
         * add hook validate put ${sessionPrefix}
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_put_${sessionPrefix}`, "", query); // prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before put ${sessionPrefix}
         *
         */
        hook.doAction(
          `${appPrefix}_before_put_${sessionPrefix}`,
          query,
          resolve
        );

        let result = await m_session.findOneAndUpdate(
          {
            _id: session_id,
          },
          {
            ...(week_no && { session_week_no: week_no }),
            ...(material && { session_material: material }),
            ...(method && { session_method: method }),
            ...(student_exp && { session_student_exp: student_exp }),
            ...(los && {
              session_los: _.isString(los) ? los : JSON.stringify(los) || "[]",
            }),
            ...(assessments && {
              session_assessments: _.isString(assessments)
                ? assessments
                : JSON.stringify(assessments) || "[]",
            }),
            ...(refs && {
              session_refs: _.isString(refs)
                ? refs
                : JSON.stringify(refs) || "[]",
            }),
            ...(status && { session_status: status }),
          }
        );

        /**
         * check if mongodb return null
         */
        if (_.isNil(result)) return resolve(`${sessionPrefix} not found`);

        /**
         * add hook after put ${sessionPrefix}
         */
        hook.doAction(`${appPrefix}_after_put_${sessionPrefix}`, result, query);

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${sessionPrefix}_put_result`, result, query); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_putSession", error);
        resolve(error);
      }
    });
  }

  /**
   * delete session by session id
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}          [return description]
   */
  _deleteSession(query) {
    return new Promise(async (resolve, reject) => {
      try {
        let results = "";

        /**
         * add hook validate delete session
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_delete_${sessionPrefix}`, "", query); //prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before delete session
         *
         */
        await hook.doAction(`${appPrefix}_before_delete_${sessionPrefix}`, query); //prettier-ignore

        /**
         * Delete permanent from mongodb if
         * have params force == "true"
         * else only change session status to deleted
         */
        if (!_.isNil(query.force) && _.eq(query.force, "true")) {
          results = await m_session.deleteOne({ _id: query.session_id });
        } else {
          results = await m_session.findOneAndUpdate(
            { _id: query.session_id },
            { session_status: "deleted" }
          );
        }

        /**
         * add hook after delete session
         *
         */
        await hook.doAction(`${appPrefix}_after_delete_${sessionPrefix}`, results, query); //prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${sessionPrefix}_delete_result`, result, querys); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_deleteSession", error);
        resolve(error);
      }
    });
  }
}

module.exports = ControllerSession;
