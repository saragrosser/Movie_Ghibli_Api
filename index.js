const mongoose = require("mongoose");
const Models = require("./models.js");
const { check, validationResult } = require("express-validator");

const Movies = Models.Movie;
const Users = Models.User;

//mongoose.connect('mongodb://localhost:27017/dbname', { useNewUrlParser: true, useUnifiedTopology: true });
// Updated connection setup without the deprecated options
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const express = require("express");
const morgan = require("morgan");
const app = express();
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

const cors = require("cors");
let allowedOrigins = [
  "http://localhost:8080",
  "http://testsite.com",
  "http://localhost:1234",
  "http://localhost:3000",
  "https://movie-ghibli-api-60afc8eabe21.herokuapp.com",
  "https://studio-ghibli-client.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

let auth = require("./auth")(app); // Import auth.js and pass the Express app for configuration
const passport = require("passport");
require("./passport"); // Import your Passport configuration

// Logging middleware
app.use(morgan("common"));

let myLogger = (req, res, next) => {
  console.log(req.url);
  next();
};

app.use(myLogger);

// Middleware that logs each request URL
app.use((req, res, next) => {
  console.log(req.url);
  next();
});

// Serve static files from 'public' directory
app.use(express.static("public"));

/**
 * Gets a list of movies
 * @async
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<Array>} A promise that resolves to an array of movies
 */
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
 * Gets data about a single movie by ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
app.get("/movies/:id", (req, res) => {
  Movies.findById(req.params.id)
    .then((movie) => {
      if (movie) {
        res.json(movie);
      } else {
        res.status(404).send("Movie not found");
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

/**
 * Adds a new movie to the database
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
app.post("/movies", (req, res) => {
  Movies.create(req.body)
    .then((newMovie) => {
      res.status(201).json(newMovie);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

/**
 * Deletes a movie by ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
app.delete("/movies/:id", (req, res) => {
  Movies.findByIdAndRemove(req.params.id)
    .then((movie) => {
      if (movie) {
        res.send(`Movie with ID: ${req.params.id} was deleted.`);
      } else {
        res.status(404).send("Movie not found");
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

/**
 * Updates a movie's information by ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
app.put("/movies/:id", (req, res) => {
  Movies.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((updatedMovie) => {
      if (updatedMovie) {
        res.json(updatedMovie);
      } else {
        res.status(404).send("Movie not found");
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

/**
 * Gets a list of users
 * @async
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<Array>} A promise that resolves to an array of users
 */
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
 * Fetches user details by username
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
app.get(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.username })
      .then((user) => {
        if (!user) {
          return res.status(404).send("User not found.");
        }
        res.json(user);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
 * Registers a new user with hashed password
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          // If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword, // Store the hashed password
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
 * Updates user info by username
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
app.put(
  "/users/:Username",
  [
    passport.authenticate("jwt", { session: false }),
    // Validation rules here as previously shown
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // CONDITION TO CHECK ADDED HERE
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send("Permission denied");
    }
    // CONDITION ENDS

    let updatedData = {
      // Only update provided fields
      ...(req.body.Username && { Username: req.body.Username }),
      ...(req.body.Email && { Email: req.body.Email }),
      ...(req.body.Birthday && { Birthday: req.body.Birthday }),
    };

    // Hash the new password if it's being updated
    if (req.body.Password) {
      updatedData.Password = Users.hashPassword(req.body.Password);
    }

    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $set: updatedData },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Adds a movie to user's list of favorites
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
app.post("/users/:username/movies/:movieId", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.username },
    {
      $addToSet: { FavoriteMovies: req.params.movieId },
    },
    { new: true }
  )
    .then((user) => {
      if (!user) {
        return res
          .status(400)
          .send(`User ${req.params.username} was not found`);
      } else {
        res.json(user);
      }
    })
    .catch((error) => res.status(500).send("Error: " + error));
});

/**
 * Removes a movie from user's list of favorites
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
app.delete("/users/:username/movies/:movieId", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.username },
    {
      $pull: { FavoriteMovies: req.params.movieId },
    },
    { new: true }
  )
    .then((user) => {
      if (!user) {
        return res
          .status(400)
          .send(`User ${req.params.username} was not found`);
      } else {
        res.send(
          `Movie ${req.params.movieId} was removed from the list of favorites.`
        );
      }
    })
    .catch((error) => res.status(500).send("Error: " + error));
});

/**
 * Deregisters a user by username
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
app.delete("/users/:username", (req, res) => {
  Users.findOneAndRemove({ Username: req.params.username })
    .then((user) => {
      if (!user) {
        res.status(400).send(`User ${req.params.username} was not found`);
      } else {
        res.send(`User ${req.params.username} was deleted.`);
      }
    })
    .catch((error) => res.status(500).send("Error: " + error));
});

/**
 * Error handling middleware
 * @param {Object} err - The error object
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

/**
 * GET route for the root that returns a default textual response.
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
app.get("/", (req, res) => {
  res.send("Welcome to My Studio Ghibli Movie API!");
});

// Define the port number
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
