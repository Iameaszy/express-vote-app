const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');

const VotesModel = mongoose.model('Votes');
const router = express.Router();
module.exports = (app) => {
  app.use('/', router);
};

router.post('/login', (req, res, next) => {
  passport.authenticate(
    'user',
    {
      session: false,
    },
    (err, user, info) => {
      if (err) {
        next(err);
      }

      if (!user) {
        res.status(400).json(info);
      }

      if (user) {
        req.logIn(
          user,
          {
            session: false,
          },
          (error) => {
            if (error) {
              return next(error);
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
              res.status(200).send([data]);
            }
          },
        );
      }
    },
  )(req, res, next);
});

router.get('/votes', async (req, res, next) => {
  let votes;
  try {
    votes = await VotesModel.find();
    res.status(200).send(votes);
    votes = null;
  } catch (e) {
    next(e);
  }
});

// for handling elections  with the same name
router.get('/create/:electionName', async (req, res, next) => {
  try {
    const name = req.params.electionName || '';
    if (name) {
      const present = await VotesModel.findOne({ name });
      if (present) {
        res.status(409).json({ message: 'Vote with this name exist' });
      } else {
        res.status(200).send(false);
      }
    }
  } catch (e) {
    next(e);
  }
});

router.post('/create', async (req, res) => {
  try {
    const { voteDetails, pollDetails } = req.body;
    const doc = await VotesModel.findOne({ name: voteDetails.title });
    if (doc) {
      return res
        .status(409)
        .json({ message: 'Vote with this title has already been created' });
    }
    const vote = new VotesModel({
      name: voteDetails.name,
      description: voteDetails.description,
      VoteType: voteDetails.type,
      expire: voteDetails.date,
      author: 'Yusuf', // to be replaced
      polls: pollDetails,
    });

    await vote.save();
    res.status(200).send(true);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});
