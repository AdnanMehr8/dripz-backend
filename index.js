const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file
const { Server } = require('http');
const rateLimit = require('express-rate-limit');
const User = require('./models/User'); // Import the User model
const productRouter = require('./routes/Product');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/Profile');
const cartRouter = require('./routes/Cart');
const cookieParser = require('cookie-parser');
const orderRouter = require('./routes/booking')
const pathe = require('path');
const path = require('path');
const app = express();

// Use cookie-parser middleware
app.use(cookieParser());

app.use(cors({
  // origin: 'https://dripz-frontend.vercel.app', 
  origin: 'http://localhost:3000', 
  credentials: true // Allow credentials
}));
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per windowMs
  delayMs: 30000 // Re-allow requests after 30 seconds
});

// app.use('/api', apiLimiter); 
app.use('/login', apiLimiter); 

// app.use(cors()); // Enable Cross-Origin Resource Sharing
// app.use(bodyParser.json()); // Parse JSON bodies
// app.use(express.json()); // Parse JSON bodies (alternative method)
// app.use(bodyParser.json({limit: '50mb'}));
app.use(express.json({limit: '50mb'}));



// Load Mongoose models
require('./models/User'); 
require('./models/Product');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log(`Connected to ${process.env.MONGODB_URI} successfully.`);
});

// Use routers for handling product, auth, and profile routes
app.use(authRouter);
app.use(productRouter);
app.use(profileRouter);
app.use(cartRouter); 
app.use(orderRouter); 


// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message });
});

const server = new Server(app); // Create the HTTP server using Express app

// app.get('*', (req,res ) => {
//   app.use(express.static(path.resolve(__dirname, "dripz-frontend", "build")));
//   res.sendFile(path.resolve(__dirname, "dripz-frontend", "build", "index.html"))
// });

server.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`)); // Start the server
