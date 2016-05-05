var winston = require('winston');
var uuid = require('node-uuid');
var path = require('path');
var keys = require('when');
var serializeError = require('serialize-error');

var error = require('../utils/error');

var serviceName = 'data-repository';
var logger = winston.loggers.get(serviceName);

function manageTypes(table, key, json) {
  var type = typeof json[key];
  switch (type) {
    case 'string':
      // check if string match date pattern
      //var matchDate = dateFormat.exec(req.body[key]);
      //if (matchDate) {
      // need to manage date
      //} else {
      table.string(key);
      //}
      break;
    case 'boolean':
      table.boolean(key);
      break;
    case 'number':
      table.decimal(key);
      break;
    case 'integer':
      table.integer(key);
      break;
    default:
      table.string(key);
      break;
  }
}

function createTableSchema(db, tableName, json) {
  return db.schema.createTable(tableName, function (table) {
    table.increments().primary();
    Object.keys(json).forEach(function (key) {
      manageTypes(table, key, json);
    });
  });
}

function alterTableSchema(db, tableName, json) {
  return db.schema.table(tableName, function(table) {
    return keys.map(json, function (key) {
      return db.schema.hasColumn(tableName, key).then(function (has) {
        if (!has) { manageTypes(table, key, json); }
      });
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
      return res.send(serializeError(err));
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