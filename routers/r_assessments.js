const ControllerAssessments = require("../controllers/c_assessments");

module.exports = (params) => {
  const c_assessments = new ControllerAssessments(params);

  /**
   * group route bo rps assessments by id
   *
   * /bo/rps/:rpsId/assessments
   *
   * GET
   * POST
   */
  app
    .route(`/bo/rps/:rpsId/assessments`)
    .get(async (req, res) => {
      let _getAssessments = await c_assessments._getAssessments({
        rps_id: req.params.rpsId,
        ...req.query,
      });
      res.json(_getAssessments);
    })
    .post(async (req, res) => {
      let _postAssessments = await c_assessments._postAssessments({
        ...req.body,
        rps_id: req.params.rpsId,
      });
      res.json(_postAssessments);
    });

  /**
   * group route bo rps assessments by id detail
   *
   * /bo/rps/:rpsId/assessments/:assessmentsId
   *
   * PUT
   * DELETE
   */
  app
    .route(`/bo/rps/:rpsId/assessments/:assessmentsId`)
    .put(async (req, res) => {
      let _putAssessments = await c_assessments._putAssessments({
        ...req.body,
        rps_id: req.params.rpsId,
        assessments_id: req.params.assessmentsId,
      });
      res.json(_putAssessments);
    })
    .delete(async (req, res) => {
      let _deleteAssessments = await c_assessments._deleteAssessments({
        ...req.query,
        rps_id: req.params.rpsId,
        assessments_id: req.params.assessmentsId,
      });
      res.json(_deleteAssessments);
    });
};
