var winston = require('winston');
var uuid = require('node-uuid');
var path = require('path');
var when = require('when');
var _ = require('lodash');

var error = require('../utils/error');

var serviceName = 'data-repository';
var logger = winston.loggers.get(serviceName);
var columnIdentifier = '_id';

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

  /**
   * map every object properties to a table column.
   * generate alter table with add column if table already exists
   * @param table{object} : KnexJS table object
   * @param object{object} : could be plain old JSON (on createTable) or only newly properties (on alterTable)
   */
  function manageTypes(table, object) {
    Object.keys(object).forEach(function (key) {
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
          var isArray = Array.isArray(value);
          var values = value;
          // create or alter the table named table+"_"+key
          var objectNameTable = tableName + '_' + key;
          if(isArray) {
            // generate current row identifier
            json[columnIdentifier] = json[columnIdentifier] || uuid.v4();
            // remove this array from json
            delete json[key];
            if (values.length > 0) {
              when.map(values, function(val) {
                // modify each array values with current row identifier
                val._fid = json[columnIdentifier];
                return toDatabase(db, objectNameTable, val);
              });
            }
          } else {
            // generate a foreign key
            var id = uuid.v4();
            // prepare current table with a string key (should contain the new foreign key)
            table.string(key);
            // set the foreign key to current json
            json[key] = id;
            // need to force the nested id object
            value.id = id;
            // create the nested table and insert the modified nested object
            toDatabase(db, objectNameTable, value);
          }
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
      // generate technical identifier
      json[columnIdentifier] = json[columnIdentifier] || uuid.v4();
      table.timestamps();
      manageTypes(table, json);
    }).catch(function(e) {
      // TODO JLL : could be better to synchronize the createTable to avoid the catch exception
      logger.warn('When creating table', e);
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
    // generate technical identifier
    json[columnIdentifier] = json[columnIdentifier] || uuid.v4();
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