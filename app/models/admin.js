// Example model

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;
const AdminSchema = new Schema(
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
    polls: { type: [ObjectId], default: [] },
    security: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    strictQuery: true,
    timestamps: true,
  },
);

AdminSchema.set('toObject', {
  virtuals: true,
});
AdminSchema.set('toJSON', {
  virtuals: true,
});

function comparePassword(password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, stat) => {
      if (err) {
        reject(err);
      } else {
        resolve(stat);
      }
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
  );
}

AdminSchema.virtual('fullname').get(function() {
  return `${this.name.last} ${this.name.first}`;
});

AdminSchema.pre('save', save);
AdminSchema.methods.comparePassword = comparePassword;
AdminSchema.methods.generateJwt = generateJwt;

mongoose.model('Admin', AdminSchema);
