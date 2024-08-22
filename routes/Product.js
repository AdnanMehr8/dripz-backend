const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Joi = require('joi');
const authenticate = require('../middleware/auth'); 
const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;
const fs = require('fs');
const multer  = require('multer');
const { v4:uuidv4 }=require('uuid')
const cloudinary=require("cloudinary").v2
require("dotenv").config()
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
  });

  //use for extention
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        console.log("insidefilename fxn",file)
        const random=uuidv4()
      cb(null, random+""+file.originalname)
    }
  })
  
  const upload = multer({ storage: storage })

 

// Define product validation schema
const productSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string(),
  price: Joi.number().required(),
  image: Joi.string().optional(),
  imageAngles: Joi.array().items(Joi.string()).optional(),
  gender: Joi.string().valid('men', 'women').required(),
  categories: Joi.string().required(),
  sizes: Joi.string().required(),
  colors: Joi.string().required(),
  inventory: Joi.number().default(0)
});

// Retrieve all products with pagination and filtering
router.get('/products', async (req, res) => {
  try {
    const { _limit = 9, _page = 1, gender, categories_like } = req.query;
    const filter = {};
    
    if (gender) filter.gender = gender;
    if (categories_like) filter.categories = { $in: [categories_like] };

    const products = await Product.find(filter)
      .skip((parseInt(_page) - 1) * parseInt(_limit))
      .limit(parseInt(_limit))
      .populate('categories');
      
    const totalProducts = await Product.countDocuments(filter);
    
    res.json({
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / _limit),
      currentPage: parseInt(_page)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/all-products', async (req, res) => {
  try {
    const { _limit = 9, _page = 1 } = req.query;

    const products = await Product.find()
    .skip((parseInt(_page) - 1) * parseInt(_limit))
    .limit(parseInt(_limit))
    .populate('categories');

    const totalProducts = await Product.countDocuments();

    res.json({
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / _limit),
      currentPage: parseInt(_page)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Retrieve a single product by ID
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('categories');
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create a new product
router.post('/products', upload.array('imageAngles', 5), async (req, res) => {
  try {
      const { error } = productSchema.validate(req.body);
      if (error) {
          return res.status(400).json(error.details);
      }

      const { title, description, price, gender, categories, sizes, colors, inventory } = req.body;

      // Check if files were uploaded
      if (!req.files || req.files.length === 0) {
          return res.status(400).json({ message: 'Image files are required' });
      }

      // Upload images to Cloudinary
      const imageUploadPromises = req.files.map(file => cloudinary.uploader.upload(file.path));
      const cloudinaryResponses = await Promise.all(imageUploadPromises);

      const imageUrls = cloudinaryResponses.map(response => response.secure_url);

      // Create a new product
      const product = new Product({
          title,
          description,
          price,
          image: imageUrls[0],
          imageAngles: imageUrls.slice(1),
          gender,
          categories,
          sizes,
          colors,
          inventory,
      });

      await product.save();

      // Delete local files
      req.files.forEach(file => {
          fs.unlink(file.path, err => {
              if (err) console.log(err);
              else console.log("Deleted file");
          });
      });

      res.status(201).json(product);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
  }
});

// router.post('/products', upload.single('image'), async (req, res) => {
//   try {
//       const { error } = productSchema.validate(req.body);
//       if (error) {
//           return res.status(400).json(error.details);
//       }

//       const { title, description, price, gender, categories, sizes, colors, inventory } = req.body;

//       // Check if the file was uploaded
//       if (!req.file) {
//           return res.status(400).json({ message: 'Image file is required' });
//       }

//       // Upload the image to Cloudinary
//       const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path);
//       const imageUrl = cloudinaryResponse.secure_url;

//       // Create a new product
//       const product = new Product({
//           title,
//           description,
//           price,
//           image: imageUrl,
//           gender,
//           categories,
//           sizes,
//           colors,
//           inventory,
//       });

//       await product.save();

//       // Delete the local file after upload
//       fs.unlink(req.file.path, (err) => {
//           if (err) console.log(err);
//           else console.log("Deleted file");
//       });

//       res.status(201).json(product);
//   } catch (err) {
//       console.error(err.message);
//       res.status(500).send('Server Error');
//   }
// });

router.put('/products/:id', upload.array('imageAngles', 5), async (req, res) => {
  try {
    const { error } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json(error.details);
    }

    const { title, description, price, gender, categories, sizes, colors, inventory } = req.body;

    // Process the uploaded images
    let imageUrls = [];
    if (req.files.length > 0) {
      const imageUploadPromises = req.files.map(file => cloudinary.uploader.upload(file.path));
      const cloudinaryResponses = await Promise.all(imageUploadPromises);
      imageUrls = cloudinaryResponses.map(response => response.secure_url);
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
      title,
      description,
      price,
      image: imageUrls[0] || undefined, // Primary image
      imageAngles: imageUrls.slice(1) || undefined, // Additional images
      gender,
      categories,
      sizes,
      colors,
      inventory,
    }, { new: true });

    // Delete the local files after upload
    req.files.forEach(file => {
      fs.unlink(file.path, err => {
        if (err) console.log(err);
        else console.log("Deleted file");
      });
    });

    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// router.put('/products/:id', async (req, res) => {
//   try {
//     const { error } = productSchema.validate(req.body);
//     if (error) {
//       return res.status(400).json(error.details);
//     }

//     const { title, description, price, gender, categories, sizes, colors, inventory, image } = req.body;
  

 
//       try {
//         const response = await cloudinary.uploader.upload(image);
       
//       } catch (error) {
//         return res.status(500).json({ message: 'Image upload failed', error: error.message });
//       }
    

//     const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
//       title,
//       description,
//       price,
//       imagePath: imagePath || undefined,
//       gender,
//       categories,
//       sizes,
//       colors,
//       inventory,
//     }, { new: true });

//     res.status(200).json(updatedProduct);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });

// Delete a product
router.delete('/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: 'Product deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
