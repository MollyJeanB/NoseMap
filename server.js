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
app.use(express.static("public"));

app.get("/smells", (req, res) => {
  Smell.find()
    .then(smells => {
      console.log("line 22", smells);
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
      console.log("33", smell.serialize());
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
  console.log("52", req.body.id);
  if (req.body.id) {
    const updatedSmell = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category
    };

    Smell.findByIdAndUpdate(
      { _id: req.body.id },
      { $set: updatedSmell },
      { new: true }
    )
      .then(updatedSmell => {
        res.send(updatedSmell);
        // res.status(204).end())
      })
      .catch(err => res.status(500).json({ message: "Something went wrong" }));
  } else {
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
  }
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

// app.put("/smells/:id", (req, res) => {
//   if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
//     res.status(400).json({
//       error: "Request path id and request body id values must match"
//     });
//   }
//
//   const updated = {};
//   const updateableFields = ["title", "description", "category"];
//   updateableFields.forEach(field => {
//     if (field in req.body) {
//       updated[field] = req.body[field];
//     }
//   });
//
//   Smell.findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
//     .then(updatedSmell => res.status(204).end())
//     .catch(err => res.status(500).json({ message: "Something went wrong" }));
// });

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
