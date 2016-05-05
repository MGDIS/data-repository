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

before(function(donePreparing) {
  this.timeout(3000);
  fs.unlink(config.db.connection.filename, function() {
    app.run(function (err, database) {
      db = database;
      donePreparing(err);
    });
  });
});

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
    logger.info('Get response %s %s', response.statusCode, response.body);
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

it('Should alter the table with a new string column', function(done) {
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

it('Should add a new boolean column', function(done) {
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

it('Should add a new iso8601 date string column', function(done) {
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

it('Should add a new number column', function(done) {
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

it.skip('Should manage multi-valued property', function(done) {
  var table = 'test';
  var multivalue = 'array';
    var properties = [multivalue];
  var json = {};
  json[multivalue] = [
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
        db.schema.hasColumn(table, multivalue).then(function (has) {
          if (!has) {
            done('Column ' + multivalue + ' does not exist in ' + table);
          } else {
            // check value
            db.select(properties).from(table).then(function (results) {
              results.should.be.an.array;
              results.length.should.be.greaterThan(0);
              results[results.length-1].should.have.property(multivalue, json[multivalue]);
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