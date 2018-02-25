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

const router = express.Router();

const jwtAuth = passport.authenticate("jwt", { session: false });

//gets all data for that user
router.get("/", jwtAuth, (req, res) => {
  Smell.find({ user: req.user.id })
    .then(smells => {
      res.json(smells.map(smell => smell.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "something is quite amiss" });
    });
});

//get data by id
router.get("/:id", (req, res) => {
  Smell.findById(req.params.id)
    .then(smell => {
      res.json(smell.serialize());
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "something went horribly awry" });
    });
});

//post new data
router.post("/", jsonParser, jwtAuth, (req, res) => {
  const requiredFields = ["title", "description", "category"];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  //create new smell with data from user
  Smell.create({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    smellLocation: req.body.smellLocation,
    user: req.user.id
  })
    .then(newSmell => res.status(201).json(newSmell.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Something is altogether wrong" });
    });
});

//delete data by id
router.delete("/:id", (req, res) => {
  Smell.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({ message: "success" });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "something went terribly wrong" });
    });
});

//update data
router.put("/:id", (req, res) => {
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

  //update Smell with that ID with user-inputted data
  Smell.findByIdAndUpdate(
    { _id: req.body.id },
    { $set: updatedSmell },
    { new: true }
  ).then(updatedSmell => {
    res.send(updatedSmell);
  });
});

module.exports = { router };
