const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');

// const AdminModel = mongoose.model('Admin');
const AdminModel = mongoose.model('Admin');

passport.use(
  'admin',
  new LocalStrategy(
{
    usernameField: 'email',
    passwordField: 'passwd',
  },
    ((email, password, done) => {
      AdminModel.findOne({
        email,
      })
        .then((user) => {
          if (!user) {
            return done(null, false, {
              message: 'Incorrect email/password',
            });
          }
          user.comparePassword(password)
            .then((stat) => {
              if (stat) {
                done(null, user, {
                  message: 'Successful login',
                });
              } else {
                done(null, false, {
                  message: 'Incorrect email/password',
                });
              }
            })
            .catch(err => console.log(err));
        })
        .catch(err => done(err));
    }),
  ),
);
