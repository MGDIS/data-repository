/**
 * Return a well formed error message
 * @param {string} code : internal error code (a HTTP status code complement like 404.1)
 * @param {string} message : human readable message
 * @param {object} detail : should be any detail object (this detail will be extended with code and message)
 * @param {object} logref : error reference to search in log file
 * @returns {object}
 */
module.exports = function(code, message, detail, logref) {
  if (!detail) { detail = {}; }
  detail.code = code;
  detail.message = message;
  detail.logref = logref;
  return detail;
};
