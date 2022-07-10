const ControllerLecturers = require("../controllers/c_lecturers");

module.exports = (params) => {
  const c_lecturers = new ControllerLecturers(params);

  /**
   * group route bo rps lecturers by id
   *
   * /bo/rps/:rpsId/lecturers
   *
   * GET
   * POST
   * PUT
   * DELETE
   */
  app
    .route(`/bo/rps/:rpsId/lecturers`)
    .get(async (req, res) => {
      let _getLecturers = await c_lecturers._getLecturers({
        rps_id: req.params.rpsId,
        ...req.query,
      });
      res.json(_getLecturers);
    })
    .post(async (req, res) => {
      let _postLecturers = await c_lecturers._postLecturers({
        ...req.body,
        rps_id: req.params.rpsId,
      });
      res.json(_postLecturers);
    });

  /**
   * group route bo rps lecturers by id detail
   *
   * /bo/rps/:rpsId/lecturers/:lecturersId
   *
   * PUT
   * DELETE
   */
  app
    .route(`/bo/rps/:rpsId/lecturers/:lecturersId`)
    .put(async (req, res) => {
      let _putLecturers = await c_lecturers._putLecturers({
        ...req.body,
        rps_id: req.params.rpsId,
        lecturers_id: req.params.lecturersId,
      });
      res.json(_putLecturers);
    })
    .delete(async (req, res) => {
      let _deleteLecturers = await c_lecturers._deleteLecturers({
        ...req.query,
        rps_id: req.params.rpsId,
        lecturers_id: req.params.lecturersId,
      });
      res.json(_deleteLecturers);
    });
};
