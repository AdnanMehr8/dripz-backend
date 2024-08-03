const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['men', 'women'],
    required: true
  },
  categories: 
    {
      type: String,
      required: true
    }
  ,
  sizes: 
    {
      type: String
    }
  ,
  colors: 
    {
      type: String
    }
  ,
  inventory: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);