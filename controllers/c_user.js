const m_user = require("../models/m_user");
class ControllerUser {
  constructor(params) {
    this.state = params;
  }

  /**
   * Get user By User Id
   *
   * @param   {[type]}  userId  [userId description]
   *
   * @return  {[type]}           [return description]
   */
  _getUserById(userId) {
    return new Promise(async (resolve, reject) => {
      try {
        resolve(this._getUser({ l_id: userId }));
        return;
      } catch (error) {
        console.log("err:_getUserById", error);
        reject(error.message);
      }
    });
  }

  /**
   * get all user by filter
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _getUser(query) {
    return new Promise(async (resolve, reject) => {
      try {
        /**
         * add hook validate get users
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_get_${userPrefix}`, "", query); //prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before get user
         *
         */
        hook.doAction(`${appPrefix}_before_get_${userPrefix}`, query, resolve); //prettier-ignore

        /**
         * add hook modify user query
         *
         */
        let newQuery = await hook.applyFilters(`${appPrefix}_${userPrefix}_query`, query); //prettier-ignore

        /**
         * get elastic data by query
         */
        const result = await m_user.find(newQuery).lean();

        /**
         * add hook after get users
         *
         * _insertLogGetUserById 10
         */
        hook.doAction(`${appPrefix}_after_get_${userPrefix}`, result, newQuery); //prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${userPrefix}_result`, result); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        console.log("err:_getUser", error);
        return reject(error);
      }
    });
  }

  /**
   * login user
   *
   * @param {*} query
   */
  _loginUser(query) {
    return new Promise(async (resolve, reject) => {
      try {
        /**
         * add hook validate login
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_login_${userPrefix}`, "", query); //prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before login
         *
         */
        hook.doAction(`${appPrefix}_before_login_${userPrefix}`, query, resolve); //prettier-ignore

        /**
         * add hook modify user query
         *
         */
        let newQuery = await hook.applyFilters(`${appPrefix}_${userPrefix}_login_query`, query); //prettier-ignore

        /**
         * get user data by query
         */
        const result = await m_user.findOne(newQuery).lean();

        console.log("result", result);

        /**
         * add hook after login users
         *
         * _insertLogGetUserById 10
         */
        hook.doAction(`${appPrefix}_after_login_${userPrefix}`, result, newQuery); //prettier-ignore

        /**
         * add hook apply filters to modify the result
         */
        let newResult = await hook.applyFilters(`${appPrefix}_${userPrefix}_login_result`, result); //prettier-ignore

        resolve(newResult);
      } catch (error) {
        reject(error);
        console.log("err:_loginUser", error);
      }
    });
  }
}

module.exports = ControllerUser;
