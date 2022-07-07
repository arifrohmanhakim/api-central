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
      let _getRps = await c_rps._getRps({});
      res.json(_getRps);
    })
    .post(async (req, res) => {
      let _searchRps = await c_rps._getRps(req.body);
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
      let _getRps = await c_rps._getRps({ ...req?.user });
      res.json(_getRps);
    })
    .post(async (req, res) => {
      let _searchRps = await c_rps._postRps(req.body);
      res.json(_searchRps);
    });
};
