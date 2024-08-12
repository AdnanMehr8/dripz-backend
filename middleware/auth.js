// const jwt = require('jsonwebtoken');
// const User = require('../models/User'); // Import User model

// // Middleware to authenticate and set req.user
// const authenticate = async (req, res, next) => {
//   // Extract token from cookies
//   // const token = req.cookies.token;
//   const token = req.headers.token;

//   if (!token) {
//     return res.status(401).json({ msg: 'No token, authorization denied' });
//   }

//   try {
//     // Verify token
//     const decoded = jwt.verify(token, process.env.SECRET_KEY); // Use the correct secret key

//     // Find user by ID and exclude password field
//     req.user = await User.findById(decoded.id).select('-password');
//     next();
//   } catch (err) {
//     console.error(err.message);
//     res.status(401).json({ msg: 'Token is not valid' });
//   }
// };

// module.exports = authenticate;

const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

// Middleware to authenticate and set req.user
const authenticate = async (req, res, next) => {
  // Extract token from Authorization header
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1] || req.cookies.token;

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY); // Use the correct secret key

    // Find user by ID and exclude password field
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token has expired' });
    }
    console.error(err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = authenticate;
