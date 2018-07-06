// Example model

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const UserSchema = new Schema(
  {
    name: {
      first: {
        type: String,
        trim: true,
        required: true,
      },
      last: {
        type: String,
        trim: true,
        required: true,
      },
      others: {
        type: String,
        trim: true,
      },
    },
    age: Number,
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    pollCount: { type: Number, default: 0 },
    polls: [ObjectId],
  },
  {
    strictQuery: true,
    timestamps: true,
  },
);

UserSchema.set('toObject', {
  virtuals: true,
});
UserSchema.set('toJSON', {
  virtuals: true,
});

function comparePassword(password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, stat) => {
      if (err) {
        reject(err);
      }
      resolve(stat);
    });
  });
}

function save(next) {
  const user = this;
  bcrypt.hash(user.password, 15, (err, hash) => {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
}

function generateJwt() {
  const user = this;

  return jwt.sign(
    {
      email: user.email,
      name: user.fullname,
      hash: user.password,
    },
    process.env.secret,
    {
      algorithm: 'RS256',
      expiresIn: 120,
      subject: user.id,
    },
  );
}

UserSchema.virtual('fullname').get(function() {
  return `${this.name.last} ${this.name.first}`;
});

UserSchema.pre('save', save);
UserSchema.methods.comparePassword = comparePassword;
UserSchema.methods.generateJwt = generateJwt;

module.exports = mongoose.model('Users', UserSchema);
