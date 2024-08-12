const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    ref: 'User',
    trim: true
  },
  location: {
    type: String
  },
  profilePicture: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema);