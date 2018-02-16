"use strict";

require("dotenv").config();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const localStrategy = require("./auth/index").localStrategy;
const jwtStrategy = require("./auth/index").jwtStrategy;
const passport = require("passport");
mongoose.Promise = global.Promise;

const { DATABASE_URL, PORT } = require("./config");
const { Smell } = require("./models");
const usersRouter = require("./users/router").router;
const authRouter = require("./auth/router").router;

const app = express();

app.use(morgan("common"));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/users", usersRouter);
app.use("/auth", authRouter);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  if (req.method === "OPTIONS") {
    return res.send(204);
  }
  next();
});

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate("jwt", { session: false });

// A protected endpoint which needs a valid JWT to access it
app.get("/protected", jwtAuth, (req, res) => {
  return res.json({
    data: "rosebud"
  });
});

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
    .then(smell => {
      res.json(smell.serialize());
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "something went horribly awry" });
    });
});

app.post("/smells", jsonParser, (req, res) => {
  const requiredFields = ["title", "description", "category"];
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

app.delete("/smells/:id", (req, res) => {
  Smell.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({ message: "success" });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "something went terribly wrong" });
    });
});

app.delete("/:id", (req, res) => {
  Smell.findByIdAndRemove(req.params.id).then(() => {
    console.log(`Deleted blog post with id \`${req.params.id}\``);
    res.status(204).end();
  });
});

app.put("/smells/:id", (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: "Request path id and request body id values must match"
    });
  }

  const updatedSmell = {
    title: req.body.title,
    description: req.body.description,
    category: req.body.category
  };

  Smell.findByIdAndUpdate(
    { _id: req.body.id },
    { $set: updatedSmell },
    { new: true }
  ).then(updatedSmell => {
    res.send(updatedSmell);
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
