const mongoose = require ('mongoose');

const LocationSchema = new mongoose.Schema ({
  locationName: {
    type: String,
    required: [true, 'Please add a Location Name'],
  },
  idNumber: {
    type: String,
    required: [true, 'Please add a ID Number'],
  },
  streat: {
    type: String,
    required: [true, 'Please add a Streat'],
  },
  neighborhood: {
    type: String,
    required: [true, 'Please add an Neighborhood'],
  },
  city: {
    type: String,
    required: [true, 'Please add an City'],
  },
  type: {
    type: String,
    required: [true, 'Please add an Type'],
  },
  share: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
  },
  description: {
    type: String,
    required: [true, 'Please add an Description'],
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      index: '2dsphere',
    },
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model ('Location', LocationSchema);
