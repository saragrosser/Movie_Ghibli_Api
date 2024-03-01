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

const top10Movies = [
  { id: 1, title: "My Neighbor Totoro", year: 1988 },
  { id: 2, title: "Kiki's Delivery Service", year: 1989 },
  { id: 3, title: "Pom Poko", year: 1994 },
  { id: 4, title: "Whisper of the Heart", year: 1995 },
  { id: 5, title: "Princess Mononoke", year: 1997 },
  { id: 6, title: "Spirited Away", year: 2001 },
  { id: 7, title: "Howl's Moving Castle", year: 2004 },
  { id: 8, title: "Ponyo", year: 2008 },
  { id: 9, title: "Arrietty", year: 2010 },
  { id: 10, title: "The Tale of the Princess Kaguya", year: 2013 },
];

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
  const movie = top10Movies.find((m) => m.id === parseInt(req.params.id));
  if (movie) {
    res.json(movie);
  } else {
    res.status(404).send("Movie not found");
  }
});

// Route for adding a movie
app.post("/movies", (req, res) => {
  const newMovie = req.body;
  if (newMovie.title && newMovie.year) {
    newMovie.id = top10Movies.length + 1; // Simple way to assign a new ID
    top10Movies.push(newMovie);
    res.status(201).json(newMovie);
  } else {
    res.status(400).send("Movie data is incomplete");
  }
});

// Route to remove a movie by ID
app.delete("/movies/:id", (req, res) => {
  const movieIndex = top10Movies.findIndex(
    (m) => m.id === parseInt(req.params.id)
  );
  if (movieIndex > -1) {
    top10Movies.splice(movieIndex, 1);
    res.send(`Movie with ID: ${req.params.id} was deleted.`);
  } else {
    res.status(404).send("Movie not found");
  }
});

// Route to update a movie's information by ID
app.put("/movies/:id", (req, res) => {
  const movieIndex = top10Movies.findIndex(
    (m) => m.id === parseInt(req.params.id)
  );
  if (movieIndex > -1) {
    const updatedMovie = {
      ...top10Movies[movieIndex],
      ...req.body,
    };
    top10Movies[movieIndex] = updatedMovie;
    res.json(updatedMovie);
  } else {
    res.status(404).send("Movie not found");
  }
});
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
