const ControllerLecturers = require("../controllers/c_lecturers");
const {
  isDBExist,
  sortQuery,
  cleanElasticQuery,
  isAndElasticQuery,
} = require("../utils/u_helpers");

module.exports = (params) => {
  const c_lecturers = new ControllerLecturers(params);

  /**
   * ==========================
   * Get Lecturers
   *
   * _validateBeforeGetLecturers
   * _lecturersFilterQuery
   * ==========================
   */
  hook.addFilter(`${appPrefix}_validate_get_${lecturerPrefix}`, appPrefix, _validateBeforeGetLecturers, 10, 2); // prettier-ignore
  hook.addFilter(`${appPrefix}_${lecturerPrefix}_elastic_query`, appPrefix, _lecturersFilterQuery, 10, 2); // prettier-ignore

  /**
   * validate before get Lecturers by id
   *
   * @param {*} res
   */
  async function _validateBeforeGetLecturers(res, query) {
    try {
      // check is elastic indixes exist
      if (!(await isDBExist(lecturerPrefix))) return "NOT_EXIST_USER";
      return res;
    } catch (error) {
      console.log("_err: _validateBeforeGetUsers", error);
      return res;
    }
  }

  /**
   * tambahkan query filter untuk elastic
   *
   * @param {*} res
   * @param {*} query
   */
  async function _lecturersFilterQuery(res, query) {
    try {
      let { u_id, u_email, u_status, u_name, um_data } = query;

      // filter by user id
      if (!_.isNil(u_id)) {
        if (isAndElasticQuery(u_id))
          res.must.push({
            terms: { u_id: _.split(cleanElasticQuery(u_id), ",") },
          });
        else
          res.should.push({
            terms: { u_id: _.split(cleanElasticQuery(u_id), ",") },
          });
      }

      // filter by user email
      if (!_.isNil(u_email)) {
        if (isAndElasticQuery(u_email))
          res.must.push({
            term: { "u_email.keyword": cleanElasticQuery(u_email) },
          });
        else
          res.should.push({
            term: { "u_email.keyword": cleanElasticQuery(u_email) },
          });
      }

      // filter by user name
      if (!_.isNil(u_name)) {
        if (isAndElasticQuery(u_name))
          res.must.push({
            wildcard: { u_name: cleanElasticQuery(`*${u_name}*`) },
          });
        else
          res.should.push({
            wildcard: { u_name: cleanElasticQuery(`*${u_name}*`) },
          });
      }

      // filter by user status
      if (!_.isNil(u_status)) {
        if (isAndElasticQuery(u_status))
          res.must.push({
            terms: { u_status: _.split(cleanElasticQuery(u_status), ",") },
          });
        else
          res.should.push({
            terms: { u_status: _.split(cleanElasticQuery(u_status), ",") },
          });
      }

      // Filter by meta
      if (!_.isNil(um_data)) {
        if (_.isString(um_data)) um_data = JSON.parse(um_data);
        for (const key in um_data) {
          if (Object.hasOwnProperty.call(um_data, key)) {
            const element = um_data[key];
            switch (element.operator) {
              case "wildcard":
                if (isAndElasticQuery(element.value))
                  res.must.push({
                    wildcard: {
                      [key]: `*${cleanElasticQuery(element.value)}*`,
                    },
                  });
                else
                  res.should.push({
                    wildcard: {
                      [key]: `*${cleanElasticQuery(element.value)}*`,
                    },
                  });
                break;
              case "terms":
                if (isAndElasticQuery(element.value))
                  res.must.push({
                    terms: {
                      [key]: _.split(cleanElasticQuery(element.value), ","),
                    },
                  });
                else
                  res.should.push({
                    terms: {
                      [key]: _.split(cleanElasticQuery(element.value), ","),
                    },
                  });
                break;

              default:
                if (isAndElasticQuery(element.value))
                  res.must.push({
                    term: { [key]: cleanElasticQuery(element.value) },
                  });
                else
                  res.should.push({
                    term: { [key]: cleanElasticQuery(element.value) },
                  });
                break;
            }
          }
        }
      }

      return res;
    } catch (error) {
      console.log("_err:_usersElasticQuery", error);
      return res;
    }
  }
};
