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
      let { username, password } = query;

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

      return {
        message: "Login Berhasil",
        token: "112233445556677", // dummy token
        datetime: moment().unix(),
      };
    } catch (error) {
      console.log("_err:_usersResult", error);
      return result;
    }
  }
};
