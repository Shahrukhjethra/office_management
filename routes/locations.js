const express = require('express');

const {
addLocation
} = require("../controllers/locations")

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/addLocation', protect, addLocation);

module.exports = router;