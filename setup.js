const mongoose = require('mongoose');
const AdminModel = mongoose.model('Admin');

const email = process.env.admin_id || '';
const pass = process.env.admin_password || '';
const name = process.env.admin_name || '';

if (!email || !pass || !name) {
  let err = new Error();
  throw new Error('email, password or name not found');
}

AdminModel.find({
  isAdmin: true
}, async function (err, docs) {
  try {

    if (err) {
      throw err;
    }

    if (docs.length > 1) {
      throw new Error('Database error.There can be only one chief admin');
    } else if (docs.length === 1) {
      const doc = docs[0];
      let stat = false;

      stat = await doc.comparePassword(pass);

      if (stat && doc.email === doc.email) {
        return console.log(`welcome  ${doc.fullname}`);
      } else {
        throw new Error('Invalid login credentials');
      }
    } else if (docs.length === 0) {
      const names = name.split(' ');
      const lastname = names[0];
      const firstname = names[1];
      const othernames = names.slice(2).join('') || '';
      let admin = new AdminModel({
        email: email,
        password: pass,
        isAdmin: true,
        name: {
          first: firstname,
          last: lastname,
          others: othernames
        },
      });
      admin.save().then((doc) => {
          console.log(`Chief admin with name ${doc.fullname} is saved`);
          console.log(`Welcome to my vote app ${doc.fullname}`);
        })
        .catch(err => console.log(err));
    }
  } catch (e) {
    console.log(e);
    process.exit(1);
  }

});
