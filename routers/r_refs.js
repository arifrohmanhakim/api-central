const ControllerRefs = require("../controllers/c_refs");

module.exports = (params) => {
  const c_refs = new ControllerRefs(params);

  /**
   * group route bo rps refs by id
   *
   * /bo/rps/:rpsId/refs
   *
   * GET
   * POST
   */
  app
    .route(`/bo/rps/:rpsId/refs`)
    .get(async (req, res) => {
      let _getRefs = await c_refs._getRefs({
        rps_id: req.params.rpsId,
        ...req.query,
      });
      res.json(_getRefs);
    })
    .post(async (req, res) => {
      let _postRefs = await c_refs._postRefs({
        ...req.body,
        rps_id: req.params.rpsId,
      });
      res.json(_postRefs);
    });

  /**
   * group route bo rps refs by id detail
   *
   * /bo/rps/:rpsId/refs/:refsId
   *
   * PUT
   * DELETE
   */
  app
    .route(`/bo/rps/:rpsId/refs/:refsId`)
    .put(async (req, res) => {
      let _putRefs = await c_refs._putRefs({
        ...req.body,
        rps_id: req.params.rpsId,
        refs_id: req.params.refsId,
      });
      res.json(_putRefs);
    })
    .delete(async (req, res) => {
      let _deleteRefs = await c_refs._deleteRefs({
        ...req.query,
        rps_id: req.params.rpsId,
        refs_id: req.params.refsId,
      });
      res.json(_deleteRefs);
    });
};
