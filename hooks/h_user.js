const { generateAccessToken } = require("../utils/u_helpers");
const ControllerUser = require("../controllers/c_user");

module.exports = (params) => {
  const c_user = new ControllerUser(params);

  /**
   * ==========================
   * Login User
   *
   * _validateBeforeLogin
   * _usersFilterQuery
   * ==========================
   */
  hook.addFilter(`${appPrefix}_validate_login_${userPrefix}`, appPrefix, _validateBeforeLogin, 10, 2); // prettier-ignore
  hook.addFilter(`${appPrefix}_${userPrefix}_login_query`, appPrefix, _usersFilterQuery, 10, 1); // prettier-ignore
  hook.addFilter(`${appPrefix}_${userPrefix}_login_result`, appPrefix, _usersResult, 10, 1); // prettier-ignore

  /**
   * validate before get User by id
   *
   * @param {*} res
   */
  async function _validateBeforeLogin(res, query) {
    try {
      const { username, password } = query;
      if (_.isNil(username) || _.eq(username, "")) {
        return "username required";
      }
      if (_.isNil(password) || _.eq(password, "")) {
        return "password required";
      }
      return res;
    } catch (error) {
      console.log("_err: _validateBeforeLogin", error);
      return res;
    }
  }

  /**
   * tambahkan query filter untuk mongodb
   *
   * @param {*} res
   * @param {*} query
   */
  async function _usersFilterQuery(query) {
    try {
      const { username, password } = query;

      query = {
        username,
        password,
      };

      return query;
    } catch (error) {
      console.log("_err:_usersFilterQuery", error);
      return query;
    }
  }

  /**
   * format the result
   * agar mudah dibaca user
   *
   * @param {*} result
   * @returns
   */
  async function _usersResult(result) {
    try {
      if (_.isNil(result)) {
        return {
          message: "Gagal Login",
          datetime: moment().unix(),
        };
      }

      const token = generateAccessToken(result);

      return {
        message: "Login Berhasil",
        token,
        datetime: moment().unix(),
      };
    } catch (error) {
      console.log("_err:_usersResult", error);
      return result;
    }
  }

  /**
   * ==========================
   * Get Users
   *
   * _validateBeforeGetUsers
   * ==========================
   */
  hook.addFilter(`${appPrefix}_${userPrefix}_query`, appPrefix, _getUsersFilterQuery, 10); // prettier-ignore

  /**
   * modify query get user
   *
   * @param {*} query
   */
  async function _getUsersFilterQuery(query) {
    try {
      const { username, type, status, fullname } = query;

      // filter by fullname
      if (!_.isNil(fullname)) {
        query.fullname = fullname;
      }

      // filter by username
      if (!_.isNil(username)) {
        query.username = username;
      }

      // filter by status
      if (!_.isNil(status)) {
        delete query.status;
        query.u_status = status;
      }

      // filter by type
      if (!_.isNil(type)) {
        delete query.type;
        query.u_type = type;
      }

      return query;
    } catch (error) {
      console.log("err: _getUsersFilterQuery", error);
      return query;
    }
  }

  /**
   * ==========================
   * Post User
   *
   * _validateBeforePostUser
   * _validateUserExists
   * _insertUserMeta
   * _insertUserToElastic
   * ==========================
   */
  hook.addFilter( `${appPrefix}_validate_post_${userPrefix}`, appPrefix, _validateBeforePostUser, 10, 2 ) // prettier-ignore
  hook.addFilter( `${appPrefix}_validate_post_${userPrefix}`, appPrefix, _validateUserExists, 20, 2 ) // prettier-ignore
  hook.addAction( `${appPrefix}_after_post_${userPrefix}`, appPrefix, _insertUserMeta, 10, 2 ) // prettier-ignore

  /**
   * Validasi body data
   *
   * @param {*} res
   * @param {*} query
   * @returns
   */
  async function _validateBeforePostUser(res, query) {
    const { fullname, username, password } = query;

    if (_.isNil(fullname) || _.eq(fullname, "")) return `fullname required`;
    if (_.isNil(username) || _.eq(username, "")) return `username required`;
    if (_.isNil(password) || _.eq(password, "")) return `password required`;
    return res;
  }

  /**
   * Cek apakah user dengan username yang dimaskkan sudh terdaftar/blm
   *
   * @param {*} res
   * @param {*} query
   * @returns
   */
  async function _validateUserExists(res, query) {
    try {
      const { username } = query;
      const isExist = await c_user._getUser({ username });
      if (!_.isEmpty(isExist))
        return `username already exists, please use other username`;
      return res;
    } catch (error) {
      return res;
    }
  }

  /**
   * tambahkan user meta ke database
   *
   * @param   {[type]}  user   [user description]
   * @param   {[type]}  query  [query description]
   *
   * @return  {[type]}         [return description]
   */
  async function _insertUserMeta(user, query) {
    if (_.isNil(user._id)) return;
    if (_.isNil(query.um_data)) return;
    c_user._postUserMeta(user._id, query);
  }
};
