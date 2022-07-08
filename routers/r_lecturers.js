const ControllerLecturers = require("../controllers/c_lecturers");

module.exports = (params) => {
  const c_lecturers = new ControllerLecturers(params);

  /**
   * group route bo rps lecturers by id
   *
   * /bo/rps/:rpsId/lecturers
   *
   * GET
   * PUT
   * DELETE
   */
  app
    .route(`/bo/rps/:rpsId/lecturers`)
    .get(async (req, res) => {
      let _getLecturersById = await c_lecturers._getLecturersById(
        req.params.rpsId
      );
      res.json(_getLecturersById);
    })
    .post(async (req, res) => {
      let _postLecturers = await c_lecturers._postLecturers({
        ...req.body,
        rps_id: req.params.rpsId,
      });
      res.json(_postLecturers);
    });
};
