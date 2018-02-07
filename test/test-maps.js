"use strict";

const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require("faker");
const mongoose = require("mongoose");

chai.should();

should = chai.should();

const { Smell } = require("../models");
const { closeServer, runServer, app } = require("../server");
const { TEST_DATABASE_URL } = require("../config");

chai.use(chaiHttp);

// describe("index page", function() {
//   it("should exist", function() {
//     return chai
//       .request(app)
//       .get("/")
//       .then(function(res) {
//         res.should.have.status(200);
//       });
//   });
// });

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
    // tear down database so we ensure no state from this test
    // effects any coming after.
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

    it("should return posts with the right fields", function() {
      let resSmell;
      return chai
        .request(app)
        .get("/smells")
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
});
