var express = require('express');

var save = require('./middlewares/save');

var router = express.Router();

module.exports = function(db) {
  router.post('/:kind', save(db));

  return router;
};