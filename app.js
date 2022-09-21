console.log("Happy Coding");

const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

// Get Movies API
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      *
    FROM
      movie
    ORDER BY
        movie_id;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray);
});

//Get Movie API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
        *
    FROM
        movie
    WHERE
        movie_id = ${movieId};`;

  const movie = await db.get(getMovieQuery);
  response.send(movie);
});

//POST New Move API
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieQuery = `
  INSERT INTO
        movie (director_id,movie_name,lead_actor)
  VALUES
        ( 
            "${directorId}",
            "${movieName}",
            "${leadActor}" )
    ;`;

  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  //response.send({ movieId: movieId });
  response.send("Movie Successfully Added");
});

// Update Movie API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovie = `
    UPDATE
        movie
    SET
        director_id = "${directorId}",
        movie_name = "${movieName}",
        lead_actor = "${leadActor}"
    WHERE
        movie_id = "${movieId}";`;
  await db.run(updateMovie);
  response.send("Movie Details Updated");
});

//Delete Movie API

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
        movie
    WHERE
        movie_id = ${movieId};`;

  await db.run(deleteMovieQuery);
  response.send("Movie DELETED Successfully");
});

// Get Director API
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
      *
    FROM
      director
    ORDER BY
        director_id;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(directorsArray);
});

// Get Movies of Specific Director API

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesOfDirectorQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
        director_id = "${directorId}"`;
  const moviesArrayOfDirector = await db.all(getMoviesOfDirectorQuery);
  response.send(moviesArrayOfDirector);
});

module.exports = app;
