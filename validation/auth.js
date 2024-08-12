const Joi = require('joi');

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;

const userRegisterSchema = Joi.object({
  username: Joi.string().min(5).max(30).required(),
  name: Joi.string().max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(passwordPattern).required(),
  
});


const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().pattern(passwordPattern),
});



module.exports = {userRegisterSchema, userLoginSchema}