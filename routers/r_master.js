const ControllerMaster = require("../controllers/c_master");

module.exports = (params) => {
  const c_master = new ControllerMaster(params);

  /**
   * group route bo rps master by id
   *
   * /master
   *
   * GET
   * POST
   */
  app
    .route(`/master/:type`)
    .get(async (req, res) => {
      let _getMaster = await c_master._getMaster({
        ...req.params,
        ...req.query,
      });
      res.json(_getMaster);
    })
    .post(async (req, res) => {
      let _postMaster = await c_master._postMaster({
        ...req.params,
        ...req.body,
      });
      res.json(_postMaster);
    });

  /**
   * group route bo rps master by id detail
   *
   * /master/:masterId
   *
   * PUT
   * DELETE
   */
  app
    .route(`/master/:type/:masterId`)
    .put(async (req, res) => {
      let _putMaster = await c_master._putMaster({
        ...req.params,
        ...req.body,
        master_id: req.params.masterId,
      });
      res.json(_putMaster);
    })
    .delete(async (req, res) => {
      let _deleteMaster = await c_master._deleteMaster({
        ...req.params,
        ...req.query,
        master_id: req.params.masterId,
      });
      res.json(_deleteMaster);
    });
};
