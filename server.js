"use strict";

const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
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
    .then(smell => res.json(smell.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "something went horribly awry" });
    });
});

app.post("/smells", jsonParser, (req, res) => {
  const requiredFields = ["title", "description", "category", "smellLocation"];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Smell.create({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    smellLocation: req.body.smellLocation
  })
    .then(newSmell => res.status(201).json(newSmell.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Something is altogether wrong" });
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
