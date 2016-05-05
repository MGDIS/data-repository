var winston = require('winston');
var uuid = require('node-uuid');
var path = require('path');
var when = require('when');
var _ = require('lodash');

var error = require('../utils/error');

var serviceName = 'data-repository';
var logger = winston.loggers.get(serviceName);

function manageTypes(table, json) {
  Object.keys(json).forEach(function (key) {
    var type = typeof json[key];
    switch (type) {
      case 'boolean':
        table.boolean(key);
        break;
      case 'number':
        table.decimal(key);
        break;
      case 'integer':
        table.integer(key);
        break;
      case 'array':
        //TODO JLL : need to implement this behavior
        break;
      default:
        table.string(key);
        break;
    }
  });
}

function createTableSchema(db, tableName, json) {
  return db.schema.createTable(tableName, function (table) {
    table.increments().primary();
    manageTypes(table, json);
  });
}

function alterTableSchema(db, tableName, json) {
  return db(tableName).columnInfo().then(function (columns) {
    var newColumns = _.omit(json, Object.keys(columns));
    return db.schema.table(tableName, function (table) {
      manageTypes(table, newColumns);
    });
  });
}

module.exports = function(db) {
  return function(req, res) {
    var tableName = req.params && req.params.kind;
    logger.info(path.basename(__filename) + ' - Post incoming JSON', {table: tableName});

    function saveIntoDatabase() {
      return db.insert([req.body]).into(tableName);
    }
    function sendResponse() {
      // insert incoming JSON into TABLE(s)
      res.status(201);
      return res.json({
        saved: true
      });
    }
    function sendError(err) {
      // insert incoming JSON into TABLE(s)
      res.status(500);
      return res.send(err);
    }

    // check existence of TABLE for req.params.kind
    db.schema.hasTable(tableName).then(function(exists) {
      // if not exist then create the table (from incoming JSON)
      var manageTable = exists ? alterTableSchema(db, tableName, req.body) : createTableSchema(db, tableName, req.body);
      manageTable.then(saveIntoDatabase).then(sendResponse).catch(function(e) {
        var msg = 'When saving into database';
        var logRef = uuid.v4();
        logger.error(msg, e);
        e.message = e.message.split('\"').join('\'');
        sendError(error(500.1, msg, {
          internal: e
        }, logRef));
      });
    });
  };
};