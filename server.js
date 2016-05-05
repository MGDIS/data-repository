// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_CONFIG_DIR = __dirname + '/config/';

var config = require('config');
var app = require('./src/app');

// Certificate
if (!config.TLSRejectUnauthorized) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

app.run(function (err) {
  if (err) throw (err);
});
