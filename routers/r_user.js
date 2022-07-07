const ControllerUser = require("../controllers/c_user");

module.exports = (params) => {
  const c_user = new ControllerUser(params);

  /**
   * group route user by id
   *
   * /user/:id
   *
   * GET
   */
  app.route(`/user/:id`).get(async (req, res) => {
    let _getUsers = await c_user._getUserById(req.params.id);
    res.json(_getUsers);
  });

  /**
   * group route by user
   *
   * /user
   *
   * GET
   * POST
   */
  app
    .route(`/user`)
    .get(async (req, res) => {
      let _getUsers = await c_user._getUser(req.query);
      res.json(_getUsers);
    })
    .post(async (req, res) => {
      let _postUsers = await c_user._postUsers(req.body);
      res.json(_postUsers);
    });

  /**
   * login user
   */
  app.post(`/auth/login`, async (req, res) => {
    let _loginUser = await c_user._loginUser(req.body);
    res.json(_loginUser);
  });

  /**
   * logout user
   *
   * dummy logout
   */
  app.post(`/auth/logout`, async (req, res) => {
    // let _logoutUser = await c_user._logoutUser(req.body);
    res.json({
      message: "Berhasil logout",
      date: moment().unix(),
    });
  });
};
