var winston = require('winston');
var uuid = require('node-uuid');
var path = require('path');
var when = require('when');
var _ = require('lodash');
var config = require('config');

var error = require('../utils/error');

var serviceName = 'data-repository';
var logger = winston.loggers.get(serviceName);
var tableIdentifierColumnName = config.constants.tableIdentifierColumnName;
var foreignColumnName = config.constants.foreignColumnName;

function generateRowId(json) {
  // generate technical identifier
  json[tableIdentifierColumnName] = json[tableIdentifierColumnName]
  if (json[tableIdentifierColumnName] === undefined) {
    json[tableIdentifierColumnName] = uuid.v4();
  }
}

/**
 * Save into database the json object.
 * If the table exists then alter it with json properties
 * Else create the table based on tableName and json properties
 * @param db
 * @param tableName
 * @param json
 * @returns {Promise|*}
 */
function toDatabase(db, tableName, json) {

  function manageObjectProperties(table, object, key, value) {
    // two cases. It's an array or a map
    var isArray = Array.isArray(value);
    // create or alter the table named table+"_"+key
    var objectNameTable = tableName + '_' + key;
    if(isArray) {
      // it's an array
      var values = value;
      generateRowId(json);
      // remove this array from json
      delete json[key];
      if (values.length > 0) {
        when.map(values, function(val) {
          // another two cases. It's an object or primitive type values
          if (typeof val !== 'object') {
            // array of primitive type
            var newVal = {};
            newVal[key] = val;
            val = newVal;
          }
          // modify each array values with current row identifier
          val[foreignColumnName] = json[tableIdentifierColumnName];
          toDatabase(db, objectNameTable, val);
        });
      }
    } else {
      // it's a map
      // generate a foreign key
      generateRowId(value);
      // prepare current table with a string key (should contain the new foreign key)
      table.string(key);
      // set the foreign key to current json
      json[key] = value[tableIdentifierColumnName];
      // create the nested table and insert the modified nested object
      toDatabase(db, objectNameTable, value);
    }
  }

  /**
   * map every object properties to a table column.
   * generate alter table with add column if table already exists
   * @param table{object} : KnexJS table object
   * @param object{object} : could be plain old JSON (on createTable) or only newly properties (on alterTable)
   */
  function manageTypes(table, object, skipId) {
    Object.keys(object).forEach(function (key) {
      // skip key if it equals tableIdentifierColumnName
      if (skipId && key === tableIdentifierColumnName) {
        return;
      }
      var value = object[key];
      var type = typeof value;
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
        case 'object':
          manageObjectProperties(table, object, key, value);
          break;
        default:
          table.string(key);
          break;
      }
    });
  }

  /**
   * Create a new table named
   * Set a technical identifier column
   * @returns {Promise}
   */
  function createTableSchema() {
    return db.schema.createTable(tableName, function (table) {
      // add table technical identifier column
      var skipId = true;
      if (json[tableIdentifierColumnName] !== undefined) {
        skipId = false;
      } else {
        table.string(tableIdentifierColumnName);
      }
      table.timestamps();
      manageTypes(table, json, skipId);
    }).catch(function(e) {
      // TODO JLL : could be better to synchronize the createTable to avoid the catch exception
      alterTableSchema();
    });
  }

  /**
   * Alter the table if needed
   * Compute the new properties and add them
   * @returns {Promise|*}
   */
  function alterTableSchema() {
    return db(tableName).columnInfo().then(function (columns) {
      var newColumns = _.omit(json, Object.keys(columns));
      return db.schema.table(tableName, function (table) {
        manageTypes(table, newColumns);
      });
    });
  }

  /**
   * Insert into the table
   * The row identifier is given or generated
   * @returns {*}
   */
  function saveIntoDatabase() {
    generateRowId(json);
    return db.insert([json]).into(tableName);
  }

  // check existence of TABLE for req.params.kind
  return db.schema.hasTable(tableName).then(function(exists) {
    // if not exist then create the table (from incoming JSON)
    var manageTable = exists ? alterTableSchema() : createTableSchema();
    return manageTable.then(saveIntoDatabase);
  });
}

module.exports = function(db) {
  return function(req, res) {
    var tableName = req.params && req.params.kind;
    logger.info(path.basename(__filename) + ' - Post incoming JSON', {table: tableName});

    /**
     * By default the POST response is a HTTP 201 Created
     * @returns {*}
     */
    function sendResponse() {
      // insert incoming JSON into TABLE(s)
      res.status(201);
      return res.json({
        saved: true
      });
    }

    /**
     * By default the POST error is a HTTP 500 Internal Server Error
     * @param err{Error} : the response Error
     */
    function sendError(err) {
      // insert incoming JSON into TABLE(s)
      res.status(500);
      return res.send(err);
    }

    toDatabase(db, tableName, req.body).then(sendResponse).catch(function(e) {
      var msg = 'When saving into database';
      var logRef = uuid.v4();
      logger.error(msg, e);
      e.message = e.message.split('\"').join('\'');
      sendError(error(500.1, msg, {
        internal: e
      }, logRef));
    });
  };
};