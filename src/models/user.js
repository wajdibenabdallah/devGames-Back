import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
mongoose.set('debug', true);

let userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  hash: String,
  salt: String
});

userSchema.methods.setPassword = password => {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
};

userSchema.methods.validPassword = password => {
  let hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
  return this.hash === hash;
};

userSchema.methods.generateJwt = () => {
  let expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      exp: parseInt(expiry.getTime() / 1000)
    },
    'MY_SECRET'
  ); // DO NOT KEEP YOUR SECRET IN THE CODE!
};

export default mongoose.model('User', userSchema);
