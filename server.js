"use strict";

const bodyParser = require("body-parser");
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const { DATABASE_URL, PORT } = require("./config");
const { Smell } = require("./models");

const app = express();

app.use(morgan("common"));
app.use(bodyParser.json());

app.get("/smells", (req, res) => {
  Smell.find()
    .then(smells => {
      res.json(smells.map(smell => smell.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "something is quite amiss" });
    });
});

app.get("/smells/:id", (req, res) => {
  Smell.findById(req.params.id)
    .then(post => res.json(post.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "something went horribly awry" });
    });
});

//errors if invalid enpoint accessed
app.use("*", function(req, res) {
  res.status(404).json({ message: "Not Found" });
});

let server;

// connect to database, then starts the server
function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app
        .listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve();
        })
        .on("error", err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { runServer, app, closeServer };
