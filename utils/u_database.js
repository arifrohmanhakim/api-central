const _ = require("lodash");
const mongoose = require("mongoose");

/**
 * add mongodb connection
 */
async function initMongoDB() {
  try {
    const {
      MONGODB_USER,
      MONGODB_PASS,
      MONGODB_HOST,
      MONGODB_DB,
      MONGODB_REPLICASET,
      MONGODB_AUTH,
    } = process.env;

    let authDB = "",
      authRepl = "",
      authUser = "";

    if (!_.isNil(MONGODB_USER) && !_.isEmpty(MONGODB_USER))
      authUser = `${MONGODB_USER}:${MONGODB_PASS}@`;
    if (!_.isNil(MONGODB_AUTH) && !_.isEmpty(MONGODB_AUTH))
      authDB = `?authSource=${MONGODB_AUTH}`;
    if (!_.isNil(MONGODB_REPLICASET) && !_.isEmpty(MONGODB_REPLICASET)) {
      if (!_.isNil(MONGODB_AUTH) && !_.isEmpty(MONGODB_AUTH))
        authRepl = `&replicaSet=${MONGODB_REPLICASET}`;
      else authRepl = `?replicaSet=${MONGODB_REPLICASET}`;
    }

    await mongoose.connect(
      `mongodb://${authUser}${MONGODB_HOST}/${MONGODB_DB}${authDB}${authRepl}`,
      {
        useNewUrlParser: true,
        // useCreateIndex: true,
        // useFindAndModify: false,
        useUnifiedTopology: true,
      }
    );
    console.log("mongodb connection successful");
  } catch (error) {
    console.log("err:initMongoDB", error);
  }
}
exports.initMongoDB = initMongoDB;
