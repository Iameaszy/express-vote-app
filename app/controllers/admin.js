const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');

const AdminModel = mongoose.model('Admin');
const router = express.Router();

module.exports = (app) => {
  app.use('/admin', router);
};

router.post('/login', (req, res, next) => {
  passport.authenticate(
    'admin',
    {
      session: false,
    },
    (err, user, info) => {
      if (err) {
        next(err);
      }

      if (!user) {
        res.json(info);
        return console.log(info);
      }

      if (user) {
        req.logIn(
          user,
          {
            session: false,
          },
          (error) => {
            if (error) {
              return console.log(error);
            }

            const token = user.generateJwt();
            const data = {
              token,
              payload: {
                email: user.email,
                name: user.fullname,
              },
              message: info,
            };
            if (req.body && req.body.remember) {
              res.cookie('pollway', data);
              res.json(data);
            } else {
              res.status(200).send([{ user: data.payload }]);
            }
          },
        );
      }
    },
  )(req, res, next);
});

router.get('/profile/:id', (req, res) => {
  const { id } = req.params;

  AdminModel.findOne({ email: id }, (err, admin) => {
    if (err) {
      return console.log(err);
    }

    res.status(200).send(admin);
  });
});
