const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports.resetPassword = async (req, res) => {
const { newPassword, confirmPassword } = req.body;
const { token } = req.params;

try {
const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

if (!user) {
  return res.status(400).json({ badrequest: 'Invalid token or expired' });
}

if (newPassword !== confirmPassword) {
  return res.status(400).json({ invalidpasswords: 'Passwords do not match' });
}

const saltRounds = 10;
const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

user.password = hashedNewPassword;
user.resetPasswordToken = null;
user.resetPasswordExpires = null;

await user.save();

res.json({ success: 'Password changed successfully!' });
} catch (err) {
console.error(err.message);
res.status(500).send('Server Error');
}
};