const mongoose = require('mongoose');
const AdminModel = mongoose.model('Admin');

const email = process.env.admin_id;
const pass = process.env.admin_password;

AdminModel.find({}, function (err, docs) {
  if (err) {
    throw err;
  }

  console.log(docs.length);
});
