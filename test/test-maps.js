"use strict";

const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require("faker");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const username = "bbaggins";
const firstName = "Bilbo";
const lastName = "bbagins";
const { JWT_SECRET } = require("../config");
const token = jwt.sign(
  {
    user: {
      username,
      firstName,
      lastName
    }
  },
  JWT_SECRET,
  {
    algorithm: "HS256",
    subject: username,
    expiresIn: "7d"
  }
);
const decoded = jwt.decode(token);

chai.should();

should = chai.should();

const { Smell } = require("../models");
const { User } = require("../users");
const { closeServer, runServer, app } = require("../server");
const { TEST_DATABASE_URL } = require("../config");

chai.use(chaiHttp);

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn("Deleting database");
    mongoose.connection
      .dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

function seedSmellData() {
  console.info("seeding smell data");
  const seedData = [];
  for (var i = 1; i <= 10; i++) {
    seedData.push({
      title: faker.lorem.sentence(),
      description: faker.lorem.sentence(),
      category: "body",
      smellLocation: { lat: 45.535536, lng: -122.620915 }
      // user: "124567"
    });
  }
  return Smell.insertMany(seedData);
}

describe("smell API resource", function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedSmellData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe("GET endpoint", function() {
    it("should return all existing smells", function() {
      let res;
      return chai
        .request(app)
        .get("/smells")
        .set("Authorization", "JWT " + token)
        .then(_res => {
          res = _res;
          res.should.have.status(200);
          res.body.should.have.lengthOf.at.least(1);
          return Smell.count();
        })
        .then(count => {
          res.body.should.have.lengthOf(count);
        });
    });

    it("should return smells with the right fields", function() {
      let resSmell;
      return chai
        .request(app)
        .get("/smells")
        .set("Authorization", "JWT " + token)
        .then(function(res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.have.lengthOf.at.least(1);

          res.body.forEach(function(smell) {
            smell.should.be.a("object");
            smell.should.include.keys(
              "id",
              "title",
              "description",
              "category",
              "smellLocation",
              "publishedAt"
            );
          });
          resSmell = res.body[0];
          return Smell.findById(resSmell.id);
        })
        .then(smell => {
          resSmell.title.should.equal(smell.title);
          resSmell.description.should.equal(smell.description);
        });
    });
  });

  describe("POST endpoint", function() {
    it("should add a new smell", function() {
      const newSmell = {
        title: faker.lorem.sentence(),
        description: faker.lorem.sentence(),
        category: "body",
        smellLocation: { lat: 45.535536, lng: -122.620915 }
      };

      return chai
        .request(app)
        .post("/smells")
        .set("Authorization", "JWT " + token)
        .send(newSmell)
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a("object");
          res.body.should.include.keys(
            "id",
            "title",
            "description",
            "category",
            "smellLocation",
            "publishedAt"
          );
          res.body.title.should.equal(newSmell.title);
          return Smell.findById(res.body.id);
        })
        .then(function(smell) {
          smell.title.should.equal(newSmell.title);
          smell.description.should.equal(newSmell.description);
          smell.smellLocation.lat.should.equal(newSmell.smellLocation.lat);
          smell.smellLocation.lng.should.equal(newSmell.smellLocation.lng);
        });
    });
  });

  describe("DELETE endpoint", function() {
    it("should delete smell by id", function() {
      let smell;

      return Smell.findOne()
        .then(_smell => {
          smell = _smell;
          return chai.request(app).delete(`/smells/${smell.id}`);
        })
        .then(res => {
          res.should.have.status(204);
          return Smell.findById(smell.id);
        })
        .then(_smell => {
          should.not.exist(_smell);
        });
    });
  });

  describe("PUT endpoint", function() {
    it("should update fields you send over", function() {
      const updateData = {
        title: "wet dogs",
        description: "happy dogs covered in mud at the park",
        category: "other"
      };

      return Smell.findOne()
        .then(smell => {
          updateData.id = smell.id;

          return chai
            .request(app)
            .put(`/smells/${smell.id}`)
            .send(updateData);
        })
        .then(res => {
          return Smell.findById(updateData.id);
        })
        .then(smell => {
          smell.title.should.equal(updateData.title);
          smell.description.should.equal(updateData.description);
          smell.category.should.equal(updateData.category);
        });
    });
  });
});
