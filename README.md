# Project Overview

The web application will provide users with access to information about Studio Ghibli movies, directors, and genres. Users will be able to sign up, update their personal information, and create a list of their favorite movies.

# Getting Started

To run this API locally, you'll need to follow these steps:

## Prerequisites

Before you begin, make sure you have the following installed on your local machine:

- **Node.js**: Download and install Node.js
- **MongoDB**: Install MongoDB

## Installation

1. Clone the repository to your local machine.
2. Navigate to the project directory:

```bash
cd your-project-directory
```

3. Install dependencies using npm. For the list of dependencies, refer to the `package.json` file:

```bash
npm install
```

## Configuration

### Development

1. Create a `.env` file in the root directory of the project.
2. Add the following MongoDB environment variables to the `.env` file:

```
CONNECTION_URI=""
```

3. Add the following Express.js environment variable to the `.env` file:

```
PORT=8080
```

### Production

1. Add the MongoDB URI to your cloud application's connection settings.
2. Replace `<your-mongodb-uri>` with your actual MongoDB URI provided by MongoDB Atlas or any other MongoDB hosting service.
3. Use `process.env.CONNECTION_URI` in your code to access the MongoDB URI.

Example MongoDB connection using Mongoose:

```javascript
const mongoose = require('mongoose');
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
```

> **Note**: By following these steps, you can set up your own MongoDB connection securely without exposing sensitive information in the codebase.

## Running the API

Start the server:

```bash
npm start
# or
node index.js
```

The API will be running locally at: `http://localhost:8080`

## Authentication

All endpoints are protected except for `/`. To access them, users must first create an account.

## Testing

You can test the API endpoints using tools like Postman.

In Postman, call the endpoint by replacing `http://localhost:8080/` with your local port number.
