const m_user = require("../models/m_user");
const m_user_meta = require("../models/m_user_meta");
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
        /**
         * add hook validate get detail user
         */
        let _validate = await hook.applyFilters(`${appPrefix}_validate_get_detail_${userPrefix}`, "", userId); //prettier-ignore
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before get detail rps
         */
        hook.doAction(`${appPrefix}_before_get_detail_${userPrefix}`, userId, resolve); //prettier-ignore

        /**
         * get mongodb data by id
         */
        const result = await m_user.findById(userId);

        console.log("user resut", result);

        resolve(result);
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
         * get mongodb data by query
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
   * get user Meta by filter
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _getUserMeta(query) {
    return new Promise(async (resolve, reject) => {
      try {
        if (_.isNil(query?.u_id)) return "u_id required";
        /**
         * get mongodb data by query
         */
        const result = await m_user_meta.find(query).lean();
        resolve(result);
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
         */
        hook.doAction(`${appPrefix}_before_login_${userPrefix}`, query, resolve); //prettier-ignore

        /**
         * add hook modify user query
         */
        let newQuery = await hook.applyFilters(`${appPrefix}_${userPrefix}_login_query`, query); //prettier-ignore

        /**
         * get user data by query
         */
        const result = await m_user.findOne(newQuery).lean();

        /**
         * add hook after login users
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

  /**
   * add new user
   *
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _postUsers(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const { fullname, username, password, type, status } = query;

        /**
         * add hook validate post user
         */
        let _validate = await hook.applyFilters(
          `${appPrefix}_validate_post_${userPrefix}`,
          "",
          query
        );
        if (!_.eq(_validate, "")) return resolve(_validate);

        /**
         * add hook before post user
         */
        await hook.doAction(
          `${appPrefix}_before_post_${userPrefix}`,
          query,
          resolve
        );

        /**
         * add data into mongodb
         */
        let user = await m_user.create({
          u_fullname: fullname || "",
          u_username: username || "",
          u_password: password || "",
          u_status: status || "active",
          u_type: type || "dosen",
        });

        /**
         * add hook after post user
         */
        await hook.doAction(
          `${appPrefix}_after_post_${userPrefix}`,
          user,
          query
        );

        resolve(user);
      } catch (error) {
        console.log("err:_postUsers", error);
        resolve(error);
      }
    });
  }

  /**
   * add new user meta
   *
   * @param   {[objectId]}  userId  [query description]
   * @param   {[string]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  _postUserMeta(userId, query) {
    return new Promise(async (resolve, reject) => {
      try {
        const { um_data } = query;

        /**
         * add hook before post user meta
         */
        hook.doAction(`${appPrefix}_before_post_${userPrefix}_meta`, userId, query, resolve) // prettier-ignore

        let meta_data = [];
        _.forEach(um_data, (val, key) =>
          meta_data.push({
            u_id: userId,
            um_key: key,
            um_value: val,
          })
        );

        // insert into mongodb
        let user_meta = await m_user_meta.create(meta_data);

        /**
         * add hook after post user meta
         */
        hook.doAction(`${appPrefix}_after_post_${userPrefix}_meta`, user_meta, userId, query) // prettier-ignore

        resolve(user_meta);
      } catch (error) {
        _e("err:_postUserMeta", error);
        resolve(new Error(_.toString(error)));
      }
    });
  }
}

module.exports = ControllerUser;
