const express = require('express');
const config = require('./server/config/config');
const glob = require('glob');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

mongoose.connect(config.db, {
  useMongoClient: true,
});
const db = mongoose.connection;
db.on('error', () => {
  throw new Error(`unable to connect to database at ${config.db}`);
});
db.once('open', () => {
  console.log('connected to database');
});

const models = glob.sync(`${config.root}/app/models/*.js`);
models.forEach((model) => {
  require(model);
});
const app = express();
app.disable('X-Powered-By');

module.exports = require('./server/config/express')(app, config);

app.listen(config.port, () => {
  console.log(`Express server listening on port ${config.port}`);
});
