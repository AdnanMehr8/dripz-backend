const mailgun = require('mailgun-js');
const DOMAIN = process.env.MAILGUN_DOMAIN; // Ensure these variables are set in .env
const api_key = process.env.MAILGUN_API_KEY;

const mg = mailgun({ apiKey: api_key, domain: DOMAIN });

module.exports = mg;
