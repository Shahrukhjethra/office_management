const asyncHandler = require ('../middleware/async');
const Location = require ('../models/Locations');
// @desc      Add Location 
// @route     POST /api/v1/location/addLocation
// @access    Public
exports.addLocation = asyncHandler (async (req, res, next) => {
  req.body.user = req.user.id;

  // Create Location
  const location = await Location.create (req.body);
  res.status (200).json ({
    success: true,
    data: location,
  });
});

// @desc      Search Location 
// @route     POST /api/v1/location/searchLocation
// @access    Public
exports.searchLocation = asyncHandler (async (req, res, next) => {
  req.body.user = req.user.id;

  // Create Location
  const location = await Location.create (req.body);
  res.status (200).json ({
    success: true,
    data: location,
  });
});
