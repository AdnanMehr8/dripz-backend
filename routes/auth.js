const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { userRegisterSchema, userLoginSchema } = require('../validation/auth');
const User = require('../models/User');
const Profile = require('../models/Profile'); // Added the Profile model
const { addIpAttempt, checkIp } = require('../utils/ipBlocklist');

const JWT_EXPIRATION = '24h';
require('dotenv').config();
const SECRET_KEY_TOKEN = process.env.SECRET_KEY || 'default-secret-key';

const ipBlock = async (req, res, next) => {
  const ipAddress = req.ip;

  if (await checkIp(ipAddress)) {
    return res.status(403).json({
      message: 'Temporary blocked for 30 seconds due to excessive attempts.',
    });
  }
  next();
};

function errorHandler(error, req, res, next) {
  let errorMessage;
  switch (error.name) {
    case 'ValidationError':
      errorMessage = Object.keys(error.errors).reduce(
        (acc, key) => ({ ...acc, [key]: error.errors[key].message }),
        {}
      );
      break;
    default:
      errorMessage = error.message;
  }
  res.status(error.statusCode || 500).json(errorMessage);
}

const hashAndSaveUser = async ({ username, name, email, password }) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({ username, name, email, password: hashedPassword });

  try {
    await newUser.save();
    return { msg: 'User registered successfully', newUser };
  } catch (error) {
    throw error;
  }
};

router.post('/register', async (req, res) => {
  try {
    const result = userRegisterSchema.validate(req.body);

    if (result.error) {
      return res.status(400).json(result.error.details);
    }

    const { username, name, email, password } = req.body;

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(409).json({ msg: 'Email already in use' });
    }
    const existingUsername = await User.findOne({ username });

    if (existingUsername) {
      return res.status(409).json({ msg: 'Username already taken' });
    }

    const registrationResult = await hashAndSaveUser({ username, name, email, password });

    // Create a profile for the new user
    const profile = new Profile({ 
      userId: registrationResult.newUser._id,
      name: name,
      email: email
    });
    await profile.save();

    // Link the profile to the user
    registrationResult.newUser.profile = profile._id;
    await registrationResult.newUser.save();

    res.json({ msg: 'User registered successfully', user: registrationResult.newUser });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

router.post('/login', ipBlock, async (req, res) => {
  try {
    const result = userLoginSchema.validate(req.body);

    if (result.error) {
      return res.status(400).json(result.error.details);
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('profile');

    if (!user) {
      return res.status(404).json({ emailNotFound: 'Email not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
       addIpAttempt(req.ip);
      return res.status(401).json({ incorrectPassword: 'Incorrect Password' });
    }

    const payload = {
      id: user.id,
      name: user.name,
    };

    jwt.sign(payload, SECRET_KEY_TOKEN, { expiresIn: JWT_EXPIRATION }, (err, token) => {
      if (err) throw err;
      res.cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "None",
        secure: true,
    });
      if (err) throw err;
      res.json({ msg: 'User Successfully Logged in', successToken: token, user });
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
  res.json({ msg: 'User logged out successfully' });
});

// Admin
router.post('/admin-login', async (req, res) => {
  try {
      const user = await Admin.findOne({ username: req.body.username, password: req.body.password });
      user.password = "";
      if (user) {
          res.status(200).send({
              data: user,
              success: true,
              message: "Login Successfully",
          });
      } else {
          res.status(200).send({
              data: user,
              success: false,
              message: "Invalid username or password",
          });
      }
  } catch (error) {
      res.status(500).send(error);

  }
});


module.exports = router;
