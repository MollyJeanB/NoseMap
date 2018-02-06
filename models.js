"use strict";

const mongoose = require("mongoose");
moongoose.Promise = global.Promise;

const smellSchema = moongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  smellLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  publishedAt: { type: Date, default: Date.now }
});

smellSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    category: this.category,
    smellLocation: this.smellLocation,
    publishedAt: this.publishedAt
  };
};

const Smell = mongoose.model("Smell", smellSchema);

module.exports = { Smell };
