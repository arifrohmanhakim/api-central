const ControllerCpmk = require("../controllers/c_cpmk");

module.exports = (params) => {
  const c_cpmk = new ControllerCpmk(params);

  /**
   * group route bo rps cpmk by id
   *
   * /bo/rps/:rpsId/cpmk
   *
   * GET
   * POST
   */
  app
    .route(`/bo/rps/:rpsId/cpmk`)
    .get(async (req, res) => {
      let _getCpmk = await c_cpmk._getCpmk({
        rps_id: req.params.rpsId,
        ...req.query,
      });
      res.json(_getCpmk);
    })
    .post(async (req, res) => {
      try {
        let _postCpmk = await c_cpmk._postCpmk({
          ...req.body,
          rps_id: req.params.rpsId,
        });
        res.json(_postCpmk);
      } catch (error) {
        console.log("err: post", error);
        res.json(error);
      }
    });

  /**
   * group route bo rps cpmk by id detail
   *
   * /bo/rps/:rpsId/cpmk/:cpmkId
   *
   * PUT
   * DELETE
   */
  app
    .route(`/bo/rps/:rpsId/cpmk/:cpmkId`)
    .get(async (req, res) => {
      if (_.isNil(req.params.cpmkId)) {
        res.json("cpmkId required");
        return;
      }
      let _getCpmkById = await c_cpmk._getCpmkById(req.params.cpmkId);
      res.json(_getCpmkById);
    })
    .put(async (req, res) => {
      let _putCpmk = await c_cpmk._putCpmk({
        ...req.body,
        rps_id: req.params.rpsId,
        cpmk_id: req.params.cpmkId,
      });
      res.json(_putCpmk);
    })
    .delete(async (req, res) => {
      let _deleteCpmk = await c_cpmk._deleteCpmk({
        ...req.query,
        rps_id: req.params.rpsId,
        cpmk_id: req.params.cpmkId,
      });
      res.json(_deleteCpmk);
    });
};
