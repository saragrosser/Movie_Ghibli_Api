const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;

// Updated connection setup without the deprecated options
mongoose.connect("mongodb://localhost:27017/movie-api-database");

const express = require("express");
const morgan = require("morgan");
const app = express();
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Logging midleware
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

// GET route for "/movies" that returns a list of movies
app.get("/movies", (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

// Route to get data about a single movie by ID
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

// Route for adding a movie
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

// Route to remove a movie by ID
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

// Route to update a movie's information by ID
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
// List of users
app.get("/users", (req, res) => {
  Users.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

// Register a new user
app.post("/users", (req, res) => {
  const newUser = req.body;
  Users.findOne({ Username: newUser.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(`${newUser.Username} already exists`);
      } else {
        Users.create(newUser)
          .then((createdUser) => res.status(201).json(createdUser))
          .catch((error) => res.status(500).send("Error: " + error));
      }
    })
    .catch((error) => res.status(500).send("Error: " + error));
});

// Update user info by username
app.put("/users/:username", (req, res) => {
  const updatedUser = req.body;
  Users.findOneAndUpdate(
    { Username: req.params.username },
    { $set: updatedUser },
    { new: true }
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        return res
          .status(400)
          .send(`User ${req.params.username} was not found`);
      } else {
        res.json(updatedUser);
      }
    })
    .catch((error) => res.status(500).send("Error: " + error));
});

// Add a movie to user's list of favorites
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

// Remove a movie from user's list of favorites
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

// Deregister a user by username
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// GET route for the root that returns a default textual response.
app.get("/", (req, res) => {
  res.send("Welcome to My Studio Ghibli Movie API!");
});

// Define the port number
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
