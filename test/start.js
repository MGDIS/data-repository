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
              results[0].should.have.property(property, json[property]);
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
        db.schema.hasColumn(table, property).then(function (has) {
          if (!has) {
            done('Column ' + property + ' does not exist in ' + table);
          } else {
            db.schema.hasColumn(table, another).then(function (has) {
              if (!has) {
                done('Column ' + another + ' does not exist in ' + table);
              } else {
                // check value
                db.select(properties).from(table).then(function (results) {
                  results.should.be.an.array;
                  results.length.should.be.greaterThan(0);
                  results[0].should.have.property(property, json[property]);
                  results.length.should.be.greaterThan(1);
                  results[1].should.have.property(property, json[property]);
                  results[1].should.have.property(another, json[another]);
                  done();
                });
              }
            });
          }
        });
      }
    });
  });
});

it.skip('Should add a new boolean column', function(done) {
  request({
    method: 'POST',
    url: 'http://localhost:' + app.port + '/test',
    json: {
      string: 'value',
      another: 'property',
      bool: false
    }
  }, function(err, response) {
    logger.info('Get response %s %s', response.statusCode, response.body);
    response.should.be.an.object;
    response.should.have.property('statusCode', 201);
    response.should.have.property('body');
    response.body.should.be.an.object;
    response.body.should.have.property('saved', true);
    // TODO JLL : check if table test exists

    // TODO JLL : check if property column is present

    // TODO JLL : check if another column is present

    // TODO JLL : check if bool column is present
    done();
  });
});

it.skip('Should add a new iso8601 date string column', function(done) {
  request({
    method: 'POST',
    url: 'http://localhost:' + app.port + '/test',
    json: {
      string: 'value',
      another: 'property',
      bool: false,
      date: new Date().toISOString()
    }
  }, function(err, response) {
    logger.info('Get response %s %s', response.statusCode, response.body);
    response.should.be.an.object;
    response.should.have.property('statusCode', 201);
    response.should.have.property('body');
    response.body.should.be.an.object;
    response.body.should.have.property('saved', true);
    // TODO JLL : check if table test exists

    // TODO JLL : check if property column is present

    // TODO JLL : check if another column is present

    // TODO JLL : check if bool column is present

    // TODO JLL : check if date column is present
    done();
  });
});

it.skip('Should add a new number column', function(done) {
  request({
    method: 'POST',
    url: 'http://localhost:' + app.port + '/test',
    json: {
      string: 'value',
      another: 'property',
      bool: false,
      date: new Date().toISOString(),
      number: 1245.89
    }
  }, function(err, response) {
    logger.info('Get response %s %s', response.statusCode, response.body);
    response.should.be.an.object;
    response.should.have.property('statusCode', 201);
    response.should.have.property('body');
    response.body.should.be.an.object;
    response.body.should.have.property('saved', true);
    // TODO JLL : check if table test exists

    // TODO JLL : check if property column is present

    // TODO JLL : check if another column is present

    // TODO JLL : check if bool column is present

    // TODO JLL : check if date column is present

    // TODO JLL : check if number column is present
    done();
  });
});