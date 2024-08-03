# Dripz Backend

## Setup

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Create a `.env` file in the root directory with the following variables:

    ```
    MONGODB_URI=your_mongodb_uri
    NODE_ENV=development
    PORT=5000
    SECRET_KEY=your_secret_key
    MAILGUN_DOMAIN=your_mailgun_domain
    MAILGUN_API_KEY=your_mailgun_api_key
    CLIENT_URL=your_client_url
    ```

4. Run `npm start` to start the server.

## API Endpoints

- **GET /api/users**: Retrieve all users.
- **POST /api/users**: Create a new user.
- **POST /api/products**: Create a new product.
- **GET /api/products**: Retrieve all products.
- **GET /api/products/:id**: Retrieve a single product by ID.
- **PUT /api/products/:id**: Update an existing product.
- **DELETE /api/products/:id**: Delete a product.
- **POST /api/profiles**: Create a new user profile.
- **PUT /api/profiles/:id**: Update an existing user profile.
