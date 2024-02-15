const express = require("express");
const morgan = require("morgan");
const app = express();

// Logging midleware
app.use(morgan("common"));

const topMovies = [
  { title: "My Neighbor Totoro", year: 1988 },
  { title: "Kiki's Delivery Service", year: 1989 },
  { title: "Pom Poko", year: 1994 },
  { title: "Whisper of the Heart", year: 1995 },
  { title: "Princess Mononoke", year: 1997 },
  { title: "Spirited Away", year: 2001 },
  { title: "Howl's Moving Castle", year: 2004 },
  { title: "Ponyo", year: 2008 },
  { title: "Arrietty", year: 2010 },
  { title: "The Tale of the Princess Kaguya", year: 1994 },
];

let myLogger = (req, res, next) => {
  console.log(req.url);
  next();
};

app.use(myLogger);

// GET route for "/movies" that returns top 10 movies as JSON.
app.get("/movies", (req, res) => {
  res.json(topMovies);
});

// GET route for "/" that returns a default textual response.
app.get("/", (req, res) => {
  res.send("Welcome to My Studio Ghibli Movie API!");
});

//Static file
app.use(express.static("public"));

// Error handling midleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.listen(8080, () => {
  console.log("My first Node test server is running on Port 8080.");
});
