const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Index email field
  password: { type: String, required: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  profile: { type: Schema.Types.ObjectId, ref: 'Profile' } // Reference to Profile model
});

module.exports = mongoose.model('User', userSchema);
