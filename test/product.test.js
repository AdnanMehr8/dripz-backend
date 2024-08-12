const request = require('supertest');
const app = require('../index'); // Import the Express app
const mongoose = require('mongoose');
const Product = require('../models/Product');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Product API', () => {
  it('should create a new product', async () => {
    const response = await request(app)
      .post('/api/products')
      .send({
        title: 'New Product',
        description: 'Product Description',
        price: 99.99,
        image: 'image.jpg',
        gender: 'men',
        categories: ['category1'],
        sizes: ['M', 'L'],
        colors: ['red'],
        inventory: 100
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('title', 'New Product');
  });
});
