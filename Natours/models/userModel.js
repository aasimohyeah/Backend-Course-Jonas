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
    select: false,
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
  passwordChangedAt: Date,
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

//INSTANCE METHOD- a method that is available in all documents of a certain collection
//document- instance of a schema
//below function is comparing encrypted and normal password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    //divided by 1000 to change millisecond to second
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

// Mongoose models have a convention to have name with first letter as capital
const User = mongoose.model('User', userSchema);

module.exports = User;
