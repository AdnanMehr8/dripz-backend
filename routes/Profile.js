const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const User = require('../models/User'); // Added the User model
const Joi = require('joi');

// Define profile validation schema
const profileSchema = Joi.object({
  userId: Joi.string().required(),
  name: Joi.string().trim(),
  bio: Joi.string(),
  location: Joi.string(),
  profilePicture: Joi.string()
});


// Create a new user profile
router.post('/profiles', async (req, res) => {
  try {
    const profile = new Profile(req.body);
    await profile.save();

    // Update the user's profile reference
    await User.findByIdAndUpdate(req.body.userId, { profile: profile._id });

    res.status(201).json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



// Update an existing user profile
router.put('/profiles/:id', async (req, res) => {
  try {
    const profile = await Profile.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// router.get('/profiles/:userId', async (req, res) => {
//   try {
//     // Find the user by userId
//     const user = await User.findById(req.params.userId).populate('profile');
//     if (!user || !user.profile) {
//       return res.status(404).json({ msg: 'Profile not found for this user' });
//     }

//     // Fetch the profile details
//     const profile = await Profile.findById(user.profile._id);
//     if (!profile) {
//       return res.status(404).json({ msg: 'Profile not found' });
//     }

//     res.json(profile);
   

//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });
router.get('/profiles/:profileId', async (req, res) => {
  try {
    // Find the profile by profileId
    const profile = await Profile.findById(req.params.profileId);
    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;