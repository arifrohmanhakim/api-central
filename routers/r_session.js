const ControllerSession = require("../controllers/c_session");

module.exports = (params) => {
  const c_session = new ControllerSession(params);

  /**
   * group route bo rps session by id
   *
   * /bo/rps/:rpsId/session
   *
   * GET
   * POST
   */
  app
    .route(`/bo/rps/:rpsId/session`)
    .get(async (req, res) => {
      let _getSession = await c_session._getSession({
        rps_id: req.params.rpsId,
        ...req.query,
      });
      res.json(_getSession);
    })
    .post(async (req, res) => {
      let _postSession = await c_session._postSession({
        ...req.body,
        rps_id: req.params.rpsId,
      });
      res.json(_postSession);
    });

  /**
   * group route bo rps session by id detail
   *
   * /bo/rps/:rpsId/session/:sessionId
   *
   * PUT
   * DELETE
   */
  app
    .route(`/bo/rps/:rpsId/session/:sessionId`)
    .get(async (req, res) => {
      if (_.isNil(req.params.sessionId)) {
        res.json("sessionId required");
        return;
      }
      let _getSessionById = await c_session._getSessionById(
        req.params.sessionId
      );
      res.json(_getSessionById);
    })
    .put(async (req, res) => {
      let _putSession = await c_session._putSession({
        ...req.body,
        rps_id: req.params.rpsId,
        session_id: req.params.sessionId,
      });
      res.json(_putSession);
    })
    .delete(async (req, res) => {
      let _deleteSession = await c_session._deleteSession({
        ...req.query,
        rps_id: req.params.rpsId,
        session_id: req.params.sessionId,
      });
      res.json(_deleteSession);
    });
};
