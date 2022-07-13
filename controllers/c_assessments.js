const m_assessments = require("../models/m_assessments");
class ControllerAssessments {
  constructor(params) {
    this.state = params;
  }

  /**
   * Get assessments By assessments Id
   *
   * @param   {[type]}  assessmentsId  [assessmentsId description]
   *
   * @return  {[type]}           [return description]
   */
  _getAssessmentsById(assessmentsId) {
    return new Promise(async (resolve, reject) => {
      try {
        /**
         * add hook validate get detail assessments
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_get_detail_${assessmentsPrefix}`, "", assessmentsId); //prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before get detail assessments
         */
        hook.doAction(`${appPrefix}_before_get_detail_${assessmentsPrefix}`, assessmentsId, resolve); //prettier-ignore

        /**
         * get mongodb data by id
         */
        const result = await m_assessments.findById(assessmentsId);

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${assessmentsPrefix}_detail_result`, result); //prettier-ignore

        resolve(newResult);
        return;
      } catch (error) {
        console.log("err:_getAssessmentsById", error);
        reject(error.message);
      }
    });
  }

  /**
   * get all assessments by filter
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _getAssessments(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const skip = query?.skip || 0,
          limit = query?.limit || env.LIMIT,
          sort = query?.sort || "-_id";

        /**
         * add hook validate get assessments
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_get_${assessmentsPrefix}`, "", query); //prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before get assessments
         *
         */
        hook.doAction(`${appPrefix}_before_get_${assessmentsPrefix}`, query, resolve); //prettier-ignore

        /**
         * add hook modify assessments query
         *
         */
        let newQuery = await hook.applyFilters(`${appPrefix}_${assessmentsPrefix}_query`, query); //prettier-ignore

        /**
         * get mongodb total data by query
         */
        const countResult = await m_assessments.countDocuments(newQuery);

        /**
         * get elastic data by query
         */
        const result = await m_assessments
          .find(newQuery, null, { skip, limit, sort })
          .lean()
          .populate({ path: "assessments_rps_id" });

        /**
         * add hook after get assessments
         */
        hook.doAction(`${appPrefix}_after_get_${assessmentsPrefix}`, {total: countResult, data: result}, newQuery); //prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${assessmentsPrefix}_get_result`, {total: countResult, data: result}, newQuery); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_getAssessments", error);
        return reject(error);
      }
    });
  }

  /**
   * add new assessments
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _postAssessments(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const { rps_id, name, percentage, status } = query;

        /**
         * add hook validate post assessments
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_post_${assessmentsPrefix}`, "", query); // prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before post assessments
         *
         */
        await hook.doAction(`${appPrefix}_before_post_${assessmentsPrefix}`, query, resolve); // prettier-ignore

        /**
         * add data into mongodb
         */
        let result = await m_assessments.create({
          assessments_rps_id: rps_id || "",
          assessments_name: name || "",
          assessments_percentage: percentage || "",
          assessments_status: status || "active",
        });

        /**
         * add hook after post assessments
         *
         */
        await hook.doAction(`${appPrefix}_after_post_${assessmentsPrefix}`, result, query); // prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${assessmentsPrefix}_post_result`, result, query); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_postAssessments", error);
        resolve(error);
      }
    });
  }

  /**
   * update assessments
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _putAssessments(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const { assessments_id, rps_id, name, percentage, status } = query;

        /**
         * add hook validate put ${assessmentsPrefix}
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_put_${assessmentsPrefix}`, "", query); // prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before put ${assessmentsPrefix}
         *
         */
        hook.doAction(`${appPrefix}_before_put_${assessmentsPrefix}`, query, resolve); // prettier-ignore
        let result = await m_assessments.findOneAndUpdate(
          {
            _id: assessments_id,
          },
          {
            ...(name && { assessments_name: name }),
            ...(percentage && { assessments_percentage: percentage }),
            ...(status && { assessments_status: status }),
          }
        );
        console.log("okokok", result);

        /**
         * check if mongodb return null
         */
        if (_.isNil(result)) return resolve(`${assessmentsPrefix} not found`);

        /**
         * add hook after put ${assessmentsPrefix}
         */
        hook.doAction(`${appPrefix}_after_put_${assessmentsPrefix}`, result, query); // prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${assessmentsPrefix}_put_result`, result, query); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_putAssessments", error);
        resolve(error);
      }
    });
  }

  /**
   * delete assessments by assessments id
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}          [return description]
   */
  _deleteAssessments(query) {
    return new Promise(async (resolve, reject) => {
      try {
        let results = "";

        /**
         * add hook validate delete assessments
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_delete_${assessmentsPrefix}`, "", query); //prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before delete assessments
         *
         */
        await hook.doAction(`${appPrefix}_before_delete_${assessmentsPrefix}`, query); //prettier-ignore

        /**
         * Delete permanent from mongodb if
         * have params force == "true"
         * else only change assessments status to deleted
         */
        if (!_.isNil(query.force) && _.eq(query.force, "true")) {
          results = await m_assessments.deleteOne({
            _id: query.assessments_id,
          });
        } else {
          results = await m_assessments.findOneAndUpdate(
            { _id: query.assessments_id },
            { assessments_status: "deleted" }
          );
        }

        /**
         * add hook after delete assessments
         *
         */
        await hook.doAction(`${appPrefix}_after_delete_${assessmentsPrefix}`, results, query); //prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${assessmentsPrefix}_delete_result`, result, querys); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_deleteAssessments", error);
        resolve(error);
      }
    });
  }
}

module.exports = ControllerAssessments;
