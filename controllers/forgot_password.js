const crypto = require('crypto');
const mailgun = require('../config/mailgun');
const User = require('../models/User'); // Ensure User model is imported

module.exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ emailnotfound: 'Email not found' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const currentTime = Date.now();

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = currentTime + 3600000; // 1 hour expiry

        await user.save();

        const message = `
  <p>Please click the following link to reset your password:</p>
  <a href="${process.env.CLIENT_URL}/reset-password/${resetToken}">Reset Password</a>
`;
        await mailgun.messages().send({
            from: 'Your Name <no-reply@example.com>',
            to: user.email,
            subject: 'Password Reset',
            text: message,
        });

        res.json({ messagereset: 'An email with password reset instructions has been sent.' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong.');
    }
};
