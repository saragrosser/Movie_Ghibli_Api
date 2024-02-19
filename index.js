const express = require("express");
const morgan = require("morgan");
const app = express();
app.use(express.json());

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

// GET route for "/movies" that returns top 10 movies as JSON.
app.get("/movies", (req, res) => {
  res.json(top10Movies);
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
