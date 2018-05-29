const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const AdminModel = mongoose.model('Admin');

passport.use('admin',
  new localStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    function (email, password, done) {
      AdminModel.findOne({
          email: email
        })
        .then(user => {
          if (!user) {
            return done(null, false, {
              message: 'Incorrect email/password'
            });
          }

          return done(null, true, {
            message: 'Successful login'
          });
        })
        .catch(err => done(err));
    }
  ))
