const express = require('express');
const config = require('./config/config');
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

new Promise((resolve) => {
  const models = glob.sync(`${config.root}/app/models/*.js`);
  models.forEach((model) => {
    require(model);
  });
  resolve();
}).then(() => {
  require('./setup');
})
  .catch(err => console.log(err));


const app = express();

module.exports = require('./config/express')(app, config);

app.listen(config.port, () => {
  console.log(`Express server listening on port ${config.port}`);
});
