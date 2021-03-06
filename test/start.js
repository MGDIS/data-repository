process.env.NODE_ENV = 'test';
process.env.NODE_CONFIG_DIR = __dirname + '/../config/';
// admin credentials
process.env.ADMIN_USERNAME = 'admin';
process.env.ADMIN_PASSWORD = 'admin';

var config = require('config');
var request = require('request');
var should = require('should');
var winston = require('winston');
var fs = require('fs');

var app = require('../src/app');
var logger = winston.loggers.get('data-repository-test');
var db = undefined;
var tableIdentifierColumnName = config.constants.tableIdentifierColumnName;
var foreignColumnName = config.constants.foreignColumnName;

/**
 * Start the service to invoke HTTP requests
 */
before(function(donePreparing) {
  this.timeout(3000);
  fs.unlink(config.db.connection.filename, function() {
    app.run(function (err, database) {
      db = database;
      donePreparing(err);
    });
  });
});

/**
 * After remove this database file
 */
after(function(doneClosing) {
  // remove db file
  fs.unlink(config.db.connection.filename, doneClosing);
});

it('Should insert incoming JSON object', function(done) {
  var table = 'test';
  var property = 'string';
  var properties = [property];
  var json = {};
  json[property] = 'value';
  request({
    method: 'POST',
    url: 'http://localhost:' + app.port + '/' + table,
    json: json
  }, function(err, response) {
    response.should.be.an.object;
    response.should.have.property('statusCode', 201);
    response.should.have.property('body');
    response.body.should.be.an.object;
    response.body.should.have.property('saved', true);
    // check if table test exists
    db.schema.hasTable(table).then(function(exists) {
      if (!exists) {
        done('Table ' + table + ' does not exist');
      } else {
        // check if string column is present
        db.schema.hasColumn(table, property).then(function(has) {
          if (!has) {
            done('Column ' + property + ' does not exist in ' + table);
          } else {
            // check value
            db.select(properties).from(table).then(function(results) {
              results.should.be.an.array;
              results.length.should.be.greaterThan(0);
              results[results.length-1].should.have.property(property, json[property]);
              done();
            });
          }
        });
      }
    });
  });
});

it('Should alter the table with a new string property', function(done) {
  var table = 'test';
  var property = 'string';
  var another = 'another';
  var properties = [property, another];
  var json = {};
  json[property] = 'value';
  json[another] = 'value';
  request({
    method: 'POST',
    url: 'http://localhost:' + app.port + '/' + table,
    json: json
  }, function (err, response) {
    if (err) done(err);
    response.should.be.an.object;
    response.should.have.property('statusCode', 201);
    response.should.have.property('body');
    response.body.should.be.an.object;
    response.body.should.have.property('saved', true);
    // check if table test exists
    db.schema.hasTable(table).then(function (exists) {
      if (!exists) {
        done('Table ' + table + ' does not exist');
      } else {
        // check if string column is present
        db.schema.hasColumn(table, another).then(function (has) {
          if (!has) {
            done('Column ' + another + ' does not exist in ' + table);
          } else {
            // check value
            db.select(properties).from(table).then(function (results) {
              results.should.be.an.array;
              results.length.should.be.greaterThan(0);
              results[results.length-1].should.have.property(property, json[property]);
              results[results.length-1].should.have.property(another, json[another]);
              done();
            });
          }
        });
      }
    });
  });
});

it('Should add a new boolean property', function(done) {
  var table = 'test';
  var property = 'string';
  var another = 'another';
  var boolean = 'bool';
  var properties = [property, another, boolean];
  var json = {};
  json[property] = 'value';
  json[another] = 'value';
  json[boolean] = false;
  request({
    method: 'POST',
    url: 'http://localhost:' + app.port + '/' + table,
    json: json
  }, function(err, response) {;
    response.should.be.an.object;
    response.should.have.property('statusCode', 201);
    response.should.have.property('body');
    response.body.should.be.an.object;
    response.body.should.have.property('saved', true);
    // check if table test exists
    db.schema.hasTable(table).then(function (exists) {
      if (!exists) {
        done('Table ' + table + ' does not exist');
      } else {
        // check if string column is present
        db.schema.hasColumn(table, boolean).then(function (has) {
          if (!has) {
            done('Column ' + boolean + ' does not exist in ' + table);
          } else {
            // check value
            db.select(properties).from(table).then(function (results) {
              results.should.be.an.array;
              results.length.should.be.greaterThan(0);
              results[results.length-1].should.have.property(property, json[property]);
              results[results.length-1].should.have.property(another, json[another]);
              results[results.length-1].should.have.property(boolean, 0 /*json[boolean]*/);
              done();
            });
          }
        });
      }
    });
  });
});

it('Should add a new iso8601 date string property', function(done) {
  var table = 'test';
  var property = 'string';
  var another = 'another';
  var boolean = 'bool';
  var isoDate = 'date';
  var properties = [property, another, boolean, isoDate];
  var json = {};
  json[property] = 'value';
  json[another] = 'value';
  json[boolean] = true;
  json[isoDate] = new Date().toISOString();
  request({
    method: 'POST',
    url: 'http://localhost:' + app.port + '/' + table,
    json: json
  }, function(err, response) {
    logger.info('Get response %s %s', response.statusCode, response.body);
    response.should.be.an.object;
    response.should.have.property('statusCode', 201);
    response.should.have.property('body');
    response.body.should.be.an.object;
    response.body.should.have.property('saved', true);
    // check if table test exists
    db.schema.hasTable(table).then(function (exists) {
      if (!exists) {
        done('Table ' + table + ' does not exist');
      } else {
        // check if string column is present
        db.schema.hasColumn(table, isoDate).then(function (has) {
          if (!has) {
            done('Column ' + isoDate + ' does not exist in ' + table);
          } else {
            // check value
            db.select(properties).from(table).then(function (results) {
              results.should.be.an.array;
              results.length.should.be.greaterThan(0);
              results[results.length-1].should.have.property(property, json[property]);
              results[results.length-1].should.have.property(another, json[another]);
              results[results.length-1].should.have.property(boolean, 1/*json[boolean]*/);
              results[results.length-1].should.have.property(isoDate, json[isoDate]);
              done();
            });
          }
        });
      }
    });
  });
});

it('Should add a new number property', function(done) {
  var table = 'test';
  var property = 'string';
  var another = 'another';
  var boolean = 'bool';
  var isoDate = 'date';
  var number = 'number';
  var properties = [property, another, boolean, isoDate, number];
  var json = {};
  json[property] = 'value';
  json[another] = 'value';
  json[boolean] = false;
  json[isoDate] = new Date().toISOString();
  json[number] = 1234.5678;
  request({
    method: 'POST',
    url: 'http://localhost:' + app.port + '/' + table,
    json: json
  }, function(err, response) {
    response.should.be.an.object;
    response.should.have.property('statusCode', 201);
    response.should.have.property('body');
    response.body.should.be.an.object;
    response.body.should.have.property('saved', true);
    // check if table test exists
    db.schema.hasTable(table).then(function (exists) {
      if (!exists) {
        done('Table ' + table + ' does not exist');
      } else {
        // check if string column is present
        db.schema.hasColumn(table, number).then(function (has) {
          if (!has) {
            done('Column ' + number + ' does not exist in ' + table);
          } else {
            // check value
            db.select(properties).from(table).then(function (results) {
              results.should.be.an.array;
              results.length.should.be.greaterThan(0);
              results[results.length-1].should.have.property(property, json[property]);
              results[results.length-1].should.have.property(another, json[another]);
              results[results.length-1].should.have.property(boolean, 0/*json[boolean]*/);
              results[results.length-1].should.have.property(isoDate, json[isoDate]);
              results[results.length-1].should.have.property(number, json[number]);
              done();
            });
          }
        });
      }
    });
  });
});

it('Should manage nested property', function(done) {
  var table = 'test';
  var nested = 'nested';
  var json = {};
  var object = {
    key: 'value',
    key2: 'value2',
    key3: true,
    key4: 13
  };
  json[nested] = object;
  request({
    method: 'POST',
    url: 'http://localhost:' + app.port + '/' + table,
    json: json
  }, function (err, response) {
    response.should.be.an.object;
    response.should.have.property('statusCode', 201);
    response.should.have.property('body');
    response.body.should.be.an.object;
    response.body.should.have.property('saved', true);
    // check if table test exists
    db.schema.hasTable(table).then(function (exists) {
      if (!exists) {
        done('Table ' + table + ' does not exist');
      } else {
        // check if string column is present
        db.schema.hasColumn(table, nested).then(function (has) {
          if (!has) {
            done('Column ' + nested + ' does not exist in ' + table);
          } else {
            // check value
            db.select().from(table).then(function (results) {
              results.should.be.an.array;
              results.length.should.be.greaterThan(0);
              results[results.length - 1].should.have.property(nested);
              should.exist(results[results.length - 1].nested);
              // check if table test exists
              var nestedTable = table + '_' + nested;
              db.schema.hasTable(nestedTable).then(function (exists) {
                if (!exists) {
                  done('Table ' + nestedTable + ' does not exist');
                } else {
                  db.select().from(nestedTable).then(function (nestedResults) {
                    nestedResults.should.be.an.array;
                    nestedResults.length.should.be.greaterThan(0);
                    nestedResults[nestedResults.length - 1].should.have.property(tableIdentifierColumnName, results[results.length -1][nested]);
                    nestedResults[nestedResults.length - 1].should.have.property('key', object['key']);
                    nestedResults[nestedResults.length - 1].should.have.property('key2', object['key2']);
                    nestedResults[nestedResults.length - 1].should.have.property('key3', 1/*object['key3']*/);
                    nestedResults[nestedResults.length - 1].should.have.property('key4', object['key4']);
                    done();
                  });
                }
              });
            });
          }
        });
      }
    });
  });
});

it('Should manage multi-valued property', function(done) {
  var table = 'test';
  var array = 'array';
  var json = {};
  json[array] = [
    {
      key: 'value',
      key2: 'value2',
      key3: true,
      key4: 13
    },
    {
      key: 'string',
      key2: 'string2',
      key3: false,
      key4: 13.4
    }
  ];
  request({
    method: 'POST',
    url: 'http://localhost:' + app.port + '/' + table,
    json: json
  }, function(err, response) {
    response.should.be.an.object;
    response.should.have.property('statusCode', 201);
    response.should.have.property('body');
    response.body.should.be.an.object;
    response.body.should.have.property('saved', true);
    // check if table test exists
    setTimeout(function() {
      db.schema.hasTable(table).then(function (exists) {
        if (!exists) {
          done('Table ' + table + ' does not exist');
        } else {
          // check if string column is present
          db.schema.hasColumn(table, array).then(function (has) {
            if (has) {
              done('Column ' + array + ' should not exist in ' + table);
            } else {
              var foreignTable = table+'_'+array;
              db.schema.hasTable(foreignTable).then(function (exists) {
                if (!exists) {
                  done('Table ' + foreignTable + ' does not exist');
                } else {
                  // check value
                  db.select().from(foreignTable).then(function (results) {
                    results.should.be.an.array;
                    results.should.length(json[array].length);
                    results[0].should.have.property('key', json[array][0].key);
                    results[0].should.have.property('key2', json[array][0].key2);
                    results[0].should.have.property('key3', 1/*json[array][0].key3*/);
                    results[0].should.have.property('key4', json[array][0].key4);
                    results[1].should.have.property('key', json[array][1].key);
                    results[1].should.have.property('key2', json[array][1].key2);
                    results[1].should.have.property('key3', 0/*json[array][1].key3*/);
                    results[1].should.have.property('key4', json[array][1].key4);
                    done();
                  });
                }
              });
            }
          });
        }
      });
    }, 1000);
  });
});

it('Should manage real world JSON', function(done) {
  var table = 'reals';
  var tags = table + '_tags';
  var friends = table + '_friends';
  var addresses = table + '_address';
  request({
    method: 'POST',
    url: 'http://localhost:' + app.port + '/' + table,
    json: require('./resources/sample.json')
  }, function(err, response) {
    response.should.be.an.object;
    response.should.have.property('statusCode', 201);
    response.should.have.property('body');
    response.body.should.be.an.object;
    response.body.should.have.property('saved', true);
    // check if table test exists
    var rowId = undefined;
    var addressId = undefined;
    setTimeout(function() {
      db.schema.hasTable(table).then(function (exists) {
        if (!exists) {
          done('Table ' + table + ' should exist');
        } else {
          db.select().from(table).then(function(results) {
            results.should.be.an.array;
            results.should.have.length(1);
            results[0].should.have.property(tableIdentifierColumnName);
            results[0].should.have.property('address');
            rowId = results[0][tableIdentifierColumnName];
            addressId = results[0]['address'];
          });
        }
      }).then(db.select().from(addresses).then(function (exists) {
        if (!exists) {
          done('Table ' + addresses + ' should exist');
        } else {
          db.select().from(addresses).then(function(results) {
            results.should.be.an.array;
            results.should.have.length(1);
            results[0].should.have.property(tableIdentifierColumnName, addressId);
            results[0].should.have.property('number', 527);
            results[0].should.have.property('street', 'Florence Avenue');
            results[0].should.have.property('city', 'Trona');
            results[0].should.have.property('state', 'California');
            results[0].should.have.property('zipcode', 6149);
            results[0].should.not.have.property(foreignColumnName);
          });
        }
      })).then(db.select().from(tags).then(function (exists) {
        if (!exists) {
          done('Table ' + tags + ' should exist');
        } else {
          db.select().from(tags).then(function(results) {
            results.should.be.an.array;
            results.should.have.length(7);
            results[0].should.have.property('tags', 'ad');
            results[0].should.have.property(foreignColumnName, rowId);
            results[1].should.have.property('tags', 'nostrud');
            results[1].should.have.property(foreignColumnName, rowId);
            results[2].should.have.property('tags', 'excepteur');
            results[2].should.have.property(foreignColumnName, rowId);
            results[3].should.have.property('tags', 'commodo');
            results[3].should.have.property(foreignColumnName, rowId);
            results[4].should.have.property('tags', 'ex');
            results[4].should.have.property(foreignColumnName, rowId);
            results[5].should.have.property('tags', 'cillum');
            results[5].should.have.property(foreignColumnName, rowId);
            results[6].should.have.property('tags', 'ullamco');
            results[6].should.have.property(foreignColumnName, rowId);
          });
        }
      })).then(db.select().from(friends).then(function (exists) {
        if (!exists) {
          done('Table ' + friends + ' should exist');
        } else {
          db.select().from(friends).then(function(results) {
            results.should.be.an.array;
            results.should.have.length(3);
            results[0].should.have.property('id', 0);
            results[0].should.have.property('name', 'Shana Riggs');
            results[0].should.have.property(foreignColumnName, rowId);
            results[1].should.have.property('id', 1);
            results[1].should.have.property('name', 'Luna Brennan');
            results[1].should.have.property(foreignColumnName, rowId);
            results[2].should.have.property('id', 2);
            results[2].should.have.property('name', 'Gray Berry');
            results[2].should.have.property(foreignColumnName, rowId);
            done();
          });
        }
      }));
    }, 1000);
  });
});

it('Should manage empty array values', function(done) {
  var table = 'empty-array';
  var conformiteTable = 'empty-array_conformite';
  var conformiteMotifsTable = 'empty-array_conformite_motifs';
  request({
    method: 'POST',
    url: 'http://localhost:' + app.port + '/' + table,
    json: {
      "id": "my-empty-array",
      "conformite" : {
        "value" : true,
        "motifs" : []
      }
    }
  }, function(err, response) {
    response.should.be.an.object;
    response.should.have.property('statusCode', 201);
    response.should.have.property('body');
    response.body.should.be.an.object;
    response.body.should.have.property('saved', true);
    // check if table test exists
    var rowId = undefined;
    var conformiteId = undefined;
    setTimeout(function() {
      db.schema.hasTable(table).then(function (exists) {
        if (!exists) {
          done('Table ' + table + ' should exist');
        } else {
          db.select().from(table).then(function(results) {
            results.should.be.an.array;
            results.should.have.length(1);
            results[0].should.have.property(tableIdentifierColumnName);
            results[0].should.have.property('conformite');
            rowId = results[0][tableIdentifierColumnName];
            conformiteId = results[0]['conformite'];
          });
        }
      }).then(db.select().from(conformiteTable).then(function (exists) {
        if (!exists) {
          done('Table ' + conformiteTable + ' should exist');
        } else {
          db.select().from(conformiteTable).then(function(results) {
            results.should.be.an.array;
            results.should.have.length(1);
            results[0].should.have.property(tableIdentifierColumnName, conformiteId);
            results[0].should.have.property('value', 1);
            results[0].should.not.have.property(foreignColumnName);
          });
        }
      })).then(db.select().from(conformiteMotifsTable).then(function (exists) {
        if (!exists) {
          done('Table ' + conformiteMotifsTable + ' should exist');
        } else {
          db.select().from(conformiteMotifsTable).then(function(results) {
            results.should.be.an.array;
            results.should.have.length(0);
            done();
          });
        }
      }));
    }, 1000);
  });
});

it.skip('For testing purpose', function(done) {
  request({
    method: 'POST',
    url: 'http://localhost:' + app.port + '/demandes-financement',
    json: require('./resources/test')
  }, function(err, response) {
    response.should.be.an.object;
    response.should.have.property('statusCode', 201);
    response.should.have.property('body');
    response.body.should.be.an.object;
    response.body.should.have.property('saved', true);
    // check if table test exists
    var rowId = undefined;
    var conformiteId = undefined;
    setTimeout(function() {
      done();
    }, 1000);
  });
});