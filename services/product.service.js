const Product = require('../models/Product');
const Joi = require('joi');


// Define product validation schema
const productSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string(),
    price: Joi.number().required(),
    image: Joi.string().optional(),
    gender: Joi.string().valid('men', 'women').required(),
    categories: Joi.string().required(),
    sizes: Joi.string().required(),
    colors: Joi.string().required(),
    inventory: Joi.number().default(0)
  });
  
