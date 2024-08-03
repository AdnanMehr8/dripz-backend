const dotenv = require("dotenv");
dotenv.config();


const CLOUD_NAME = process.env.CLOUD_NAME;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

module.exports = {
    
    CLOUD_NAME,
    API_KEY,
    API_SECRET,
}