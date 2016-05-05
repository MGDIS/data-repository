var config = require('config');
var express = require('express');
var winston = require('winston');
var bodyParser = require('body-parser');
var cors = require('cors');
var Knex = require('knex');

var app = express();
var logger = winston.loggers.get(config.serviceName);

// Cross Origin
app.use(cors());

// parse body in JSON to make an easy response
app.use(bodyParser.json({ strict: false }));

function runApp(callback) {
  // SQL driver
  var db = Knex(config.db);
  
  app.listen(config.APP_PORT, function (err) {
    logger.info('Starting %s', config.serviceName);
    if (err) {
      logger.error('Could not run server : ' + err);
      return callback(err);
    }
    else {
      app.use(config.expositionPath, require('./index')(db));

      logger.info('Listening on http://localhost:%s', config.APP_PORT);
      callback(undefined, db);
    }
  });
}

module.exports = {
  app: app,
  run: runApp,
  port: config.APP_PORT
};
