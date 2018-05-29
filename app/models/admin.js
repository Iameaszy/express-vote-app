// Example model

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const AdminSchema = new Schema({
  fname: {
    type: String,
    alias: 'firstname'
  },
  lname: {
    type: String,
    alias: 'lastname'
  },
  age: Number,
  email: {
    type: String,
    unique: Boolean,
    lowercase: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  security: {
    type: String
  },
  isAdmin: Boolean
}, {
  strictQuery: true,
  timestamps: true
})

AdminSchema.pre('save', function (next) {
  const user = this;
  bcrypt.hash(user.password, 15, function (err, hash) {
    if (err) {
      return next(err);
    }
    this.password = hash;
    next();
  });
});
AdminSchema.virtual('fullname').get(function () {
  return `${this.firstname} ${this.lastname}`
});

AdminSchema.methods.comparePassword = function (password) {
  let stat = false;
  bcrypt.compare(password, this.password, function (err, stat) {
    if (err) {
      throw err;
    }

    stat = true;
  });

  return stat;
}
mongoose.model('Admin', AdminSchema);
