const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');

const UserModel = mongoose.model('Users');
const AdminModel = mongoose.model('Admin');

passport.use(
  'admin',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'passwd',
    },
    (email, password, done) => {
      AdminModel.findOne({
        email,
      })
        .then((user) => {
          if (!user) {
            return done(null, false, {
              message: 'Incorrect email/password',
            });
          }
          user
            .comparePassword(password)
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
            .catch((err) => console.log(err));
        })
        .catch((err) => done(err));
    },
  ),
);

passport.use(
  'user',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'passwd',
    },
    async (email, password, done) => {
      try {
        // Checkin for user
        const user = await UserModel.findOne({ email });
        if (!user) {
          // Checking whether a user has an admin priviledge
          const admin = await AdminModel.findOne({ email });
          if (!admin) {
            done(null, false, {
              message: 'Incorrect email/password',
            });
          } else {
            const stats = await admin.comparePassword(password);
            if (stats) {
              done(null, admin, {
                message: 'Successful login',
              });
            } else {
              done(null, false, {
                message: 'Incorrect email/password',
              });
            }
          }
          return;
        }
        const stat = await user.comparePassword(password);
        if (stat) {
          done(null, user, {
            message: 'Successful login',
          });
        } else {
          done(null, false, {
            message: 'Incorrect email/password',
          });
        }
      } catch (err) {
        done(err);
      }
    },
  ),
);
