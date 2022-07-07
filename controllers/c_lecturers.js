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
        /**
         * add hook validate get users
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_get_${lecturerPrefix}`, "", query); //prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before get lecturers
         *
         */
        hook.doAction(`${appPrefix}_before_get_${lecturerPrefix}`, query, resolve); //prettier-ignore

        /**
         * add hook modify lecturers query
         *
         */
        let newQuery = await hook.applyFilters(`${appPrefix}_${lecturerPrefix}_query`, query); //prettier-ignore

        /**
         * get elastic data by query
         */
        const result = await m_lecturers.find(newQuery).lean();

        /**
         * add hook after get users
         *
         * _insertLogGetUserById 10
         */
        hook.doAction(`${appPrefix}_after_get_${lecturerPrefix}`, result, newQuery); //prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${lecturerPrefix}_result`, result); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_getLecturers", error);
        return reject(error);
      }
    });
  }
}

module.exports = ControllerLecturers;
