"use strict";
const express = require("express");
const bodyParser = require("body-parser");

const { User } = require("./models");

const router = express.Router();

const jsonParser = bodyParser.json();

// Post to register a new user
router.post("/", jsonParser, (req, res) => {
  const requiredFields = ["username", "password"];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: "Missing field",
      location: missingField
    });
  }

  const stringFields = ["username", "password", "firstName", "lastName"];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== "string"
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: "Incorrect field type: expected string",
      location: nonStringField
    });
  }

  const explicityTrimmedFields = ["username", "password"];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );
  //error if username or password submitted with whitespace
  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: "Cannot start or end with whitespace",
      location: nonTrimmedField
    });
  }
  //min and max number of characters of username and password
  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 7,
      max: 72
    }
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      "min" in sizedFields[field] &&
      req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      "max" in sizedFields[field] &&
      req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField].min} characters long`
        : `Must be at most ${sizedFields[tooLargeField].max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let { username, password, firstName = "", lastName = "" } = req.body;
  //trim whitespace from firstname and lastname
  firstName = firstName.trim();
  lastName = lastName.trim();

  return User.find({ username })
    .count()
    .then(count => {
      if (count > 0) {
        //error if username already taken
        return Promise.reject({
          code: 422,
          reason: "ValidationError",
          message: "Username already taken",
          location: "username"
        });
      }
      // If there is no existing user, hash the password
      return User.hashPassword(password);
    })
    .then(hash => {
      User.create({
        username,
        password: hash,
        firstName,
        lastName
      })
        .then(user => {
          return res.status(201).json(user.serialize());
        })
        .catch(err => {
          if (err.reason === "ValidationError") {
            return res.status(err.code).json(err);
          }
          res.status(500).json({ code: 500, message: "Internal server error" });
        });
    })
    .catch(err => {
      res.status(422).json(err);
    });
});

module.exports = { router };
