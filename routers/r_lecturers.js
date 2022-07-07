const ControllerUser = require("../controllers/c_lecturers");

module.exports = (params) => {
  const c_user = new ControllerUser(params);

  /**
   * group route user by id
   *
   * /${VERSION}/user/:id
   *
   * GET
   * PUT
   * DELETE
   */
  app.route(`/${env.VERSION}/user/:id`).get(async (req, res) => {
    let _getUsers = await c_user._getUserById(req.params.id);
    res.json(_getUsers);
  });

  /**
   * group route by user
   *
   * /${VERSION}/user
   *
   * GET
   * POST
   */
  app
    .route(`/${env.VERSION}/user`)
    .get(async (req, res) => {
      let _getUsers = await c_user._getUsers(req.query);
      res.json(_getUsers);
    })
    .post(async (req, res) => {
      let _postUsers = await c_user._postUsers(req.body);
      res.json(_postUsers);
    });
};
