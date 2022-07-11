const ControllerRps = require("../controllers/c_rps");

module.exports = (params) => {
  const c_rps = new ControllerRps(params);

  /**
   * group route rps by id
   *
   * /rps/:id - get detail rps
   *
   * GET
   */
  app.route(`/rps/:id`).get(async (req, res) => {
    let _getRpsById = await c_rps._getRpsById(req.params.id);
    res.json(_getRpsById);
  });

  /**
   * group route by rps
   *
   * /rps
   *
   * GET - get all rps
   * POST - search rps
   */
  app
    .route(`/rps`)
    .get(async (req, res) => {
      let _getRps = await c_rps._getRps({ ...req.query });
      res.json(_getRps);
    })
    .post(async (req, res) => {
      let _searchRps = await c_rps._getRps({ ...req.body, user: req?.user });
      res.json(_searchRps);
    });

  /**
   * group route by bo/rps
   *
   * /bo/rps
   *
   * GET - get all rps yang diampu
   * POST - create / revisi rps baru
   */
  app
    .route(`/bo/rps`)
    .get(async (req, res) => {
      if (_.isNil(req.user)) {
        res.json({
          status: "error",
          message: "token yang anda masukan salah",
          datetime: moment().unix(),
        });
      }
      let _getRps = await c_rps._getRps({
        ...req.query,
        ...req.params,
        creator: req.user._id,
      });
      res.json(_getRps);
    })
    .post(async (req, res) => {
      let _postRps = await c_rps._postRps(req.body);
      res.json(_postRps);
    });

  /**
   * group route by bo/rps/:rpsId
   *
   * /bo/rps/:rpsId
   *
   * GET - get rps detail yang diampu
   * PUT - update rps
   * DELETE - delete rps
   */
  app
    .route(`/bo/rps/:rpsId`)
    .get(async (req, res) => {
      let _getRpsById = await c_rps._getRpsById(req.params.rpsId);
      res.json(_getRpsById);
    })
    .put(async (req, res) => {
      let _putRps = await c_rps._putRps({
        rps_id: req.params.rpsId,
        ...req.body,
      });
      res.json(_putRps);
    })
    .delete(async (req, res) => {
      let _deleteRps = await c_rps._deleteRps({
        rps_id: req.params.rpsId,
        ...req.query,
      });
      res.json(_deleteRps);
    });
};
