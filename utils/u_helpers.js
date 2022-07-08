/**
 * Helpers utilities
 */
const ObjectId = require("mongoose").Types.ObjectId;
const fs = require("fs");

/**
 * check apakah nilai ini adalah sebuah json
 *
 * @param   {[type]}  str  [str description]
 *
 * @return  {[type]}       [return description]
 */
function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
exports.isJson = isJson;

/**
 * Import all file in folder
 *
 * @param   {[type]}  str  [str description]
 *
 * @return  {[type]}       [return description]
 */
function importFile(folder, skip = [], params = {}) {
  try {
    fs.readdirSync(folder).forEach((file) => {
      if (!_.isEmpty(skip) && _.includes(skip, file)) return;
      require(folder + file)(params);
    });
  } catch (error) {
    console.log("e", error);
  }
}
exports.importFile = importFile;

/**
 * generate access token
 *
 * @param {*} user
 * @returns
 */
function generateAccessToken(user) {
  return jwt.sign(user, env.TOKEN_SECRET, { expiresIn: "7d" });
}
exports.generateAccessToken = generateAccessToken;

/**
 * check authenticateJWT
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  // routeWhitelist - no required token
  const routeWhitelist = [`GET /`, `POST /auth/login`, `POST /user`];
  if (
    _.includes(routeWhitelist, `${req.method} ${req.url}`) ||
    _.find(
      _.filter(routeWhitelist, (val) => _.includes(val, "*")),
      (val) => _.includes(`${req.method} ${req.url}`, _.replace(val, "*", ""))
    )
  )
    return next();

  if (_.isNil(authHeader)) {
    res.json({
      status: `error`,
      message: `access denied`,
    });
  } else {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, env.TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  }
}
exports.authenticateJWT = authenticateJWT;

/**
 * check is string valid mongoDB objectId
 *
 * @param {*} id
 * @returns
 */
function isValidObjectId(id) {
  if (ObjectId.isValid(id)) {
    if (String(new ObjectId(id)) === id) return true;
    return false;
  }
  return false;
}
exports.isValidObjectId = isValidObjectId;
