const path = require('path');

const rootPath = path.normalize(`${__dirname  }/..`);
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'vote-app',
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/vote-app-development',
  },

  test: {
    root: rootPath,
    app: {
      name: 'vote-app',
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/vote-app-test',
  },

  production: {
    root: rootPath,
    app: {
      name: 'vote-app',
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/vote-app-production',
  },
};

module.exports = config[env];
