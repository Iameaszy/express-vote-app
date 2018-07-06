const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');

const VotesModel = mongoose.model('Votes');
const UserModel = mongoose.model('Users');
const AdminModel = mongoose.model('Admin');
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
        res.status(400).send(info);
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

router.post('/vote/:id', async (req, res, next) => {
  const { id, ind } = req.body;
  try {
    const query = {
      [`polls.$.textCandidates.${ind}.votes`]: 1,
      'polls.$.voteCount': 1,
    };
    const vote = await VotesModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $inc: query,
      },
    );
    res.json(vote);
  } catch (e) {
    console.log(e);
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

router.post('/create', async (req, res, next) => {
  try {
    const { voteDetails, pollDetails, user } = req.body;
    const vote = new VotesModel({
      name: voteDetails.name,
      description: voteDetails.description,
      VoteType: voteDetails.type,
      expire: voteDetails.date,
      author: user.payload.name,
      polls: pollDetails,
    });

    const doc = await vote.save();
    const stat = await UserModel.findOneAndUpdate(
      { email: user.payload.email },
      { $push: { polls: doc.id } },
    );
    if (!stat) {
      const stats = await AdminModel.findOneAndUpdate(
        { email: user.payload.email },
        { $push: { polls: doc.id } },
      );
    }
    res.status(200).send(true);
  } catch (e) {
    next(e);
  }
});
