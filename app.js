const express = require("express");
const app = express();
const dotenv = require("dotenv");
const path = require("path");
const bodyParser = require("body-parser");
const moment = require("moment");
const hooks = require("@wordpress/hooks");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const {
  isJson,
  importFile,
  optionQueue,
  authenticateJWT,
} = require("./utils/u_helpers");
const { initMongoDB, initRedis, initElastic } = require("./utils/u_database");

dotenv.config();
const env = process.env;
const root = path.resolve(__dirname);

// global variable
global.mongodb = initMongoDB();
global.env = env;
global.app = app;
global.hook = hooks.createHooks();
global._ = _;
global.moment = moment;
global.jwt = jwt;

global.appPrefix = env.PREFIX;
global.lecturersPrefix = env.LECTURERS_PREFIX;
global.userPrefix = env.USER_PREFIX;
global.rpsPrefix = env.RPS_PREFIX;
global.cpmkPrefix = env.CPMK_PREFIX;
global.refsPrefix = env.REFS_PREFIX;
global.assessmentsPrefix = env.ASSESSMENTS_PREFIX;

// setting middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(authenticateJWT);

// Import compoent
importFile(`${root}/routers/`, [".DS_Store"]); // import semua file router
importFile(`${root}/hooks/`, [".DS_Store"]); // import semua file hooks

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(env.PORT || 3000, () => {
  console.log(`Listening on port ${env.PORT || 3000}`);
});
