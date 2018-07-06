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

(async () => {
  try {
    const models = glob.sync(`${config.root}/app/models/*.js`);
    models.forEach((model) => {
      require(model);
    });

    const app = express();
    app.enable('trust proxy');
    app.disable('x-powered-by');
    app.use((req, res, next) => {
      console.log('ip:', req.ip);
      next();
    });
    module.exports = require('./config/express')(app, config);
    require('./setup');
    app.listen(config.port, () => {
      console.log(`Express server listening on port ${config.port}`);
    });
  } catch (err) {
    console.log(err);
  }
})();
