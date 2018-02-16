"use strict";

exports.DATABASE_URL =
  process.env.DATABASE_URL || "mongodb://localhost/smellDb";
exports.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || "mongodb://localhost/test-smells-app";
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";
// exports.JWT_SECRET = "boogaboogabooga444444444444444";
