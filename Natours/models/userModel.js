const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Enter name!'],
  },
  email: {
    type: String,
    required: [true, 'Enter email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Enter valid email!'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Enter a password!'],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Confirm your password!'],
    validate: {
      //This only works with create() and save()
      validator: function (el) {
        return el === this.password;
      },
    },
    message: 'Passwords are not the same!',
  },
});

userSchema.pre('save', async function (next) {
  //Only run this function if password was actually modified
  if (!this.isModified('password')) {
    return next();
  }

  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //set to undefined is a hacky way of hiding the passwordConfirm in the db entry
  this.passwordConfirm = undefined;
});

// Mongoose models have a convention to have name with first letter as capital
const User = mongoose.model('User', userSchema);

module.exports = User;
