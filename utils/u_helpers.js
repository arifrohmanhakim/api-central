/**
 * Helpers utilities
 */

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
