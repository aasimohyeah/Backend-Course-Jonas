const crypto = require('crypto');
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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    //enum means list of accepted values
    default: 'user',
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
      //Below function is called each time a new document is created
      validator: function (el) {
        return el === this.password;
      },
    },
    message: 'Passwords are not the same!',
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  paswordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
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

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1 * 1000; //1 sec
  next();
});

// '/^find/' is regex for all functions that start with find
userSchema.pre(/^find/, function (next) {
  //this points to the current query
  this.find({ active: { $ne: false } });
  next();
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
    //console.log(JWTTimestamp, changedTimeStamp);
    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  //resetToken is unencrypted string, passwordResetToken is
  //encrypted string which then gets stored in the db

  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.paswordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Mongoose models have a convention to have name with first letter as capital
const User = mongoose.model('User', userSchema);

module.exports = User;
