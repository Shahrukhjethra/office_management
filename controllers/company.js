const asyncHandler = require ('../middleware/async');
const Company = require ('../models/Company');
const ErrorResponse = require ('../utils/errorResponse');

exports.create = asyncHandler (async (req, res, next) => {
  const {companyName} = req.body;

  const company = await Company.create ({companyName});

  res.status (200).json ({
    success: true,
    data: company,
  });
});

exports.read = asyncHandler (async (req, res, next) => {
  const company = await Company.find ();
  res.status (200).json ({
    success: true,
    data: company,
  });
});

exports.updateByid = asyncHandler (async (req, res, next) => {
  let company = await Company.findById (req.params.id);
  if (!company) {
    return next (
      new ErrorResponse (`No company with the id of ${req.params.id}`, 404)
    );
  }

  company = await Company.findByIdAndUpdate (req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status (200).json ({
    success: true,
    data: company,
  });
});

exports.deleteByid = asyncHandler (async (req, res, next) => {
  let company = await Company.findById (req.params.id);
  if (!company) {
    return next (
      new ErrorResponse (`No company with the id of ${req.params.id}`, 404)
    );
  }
  await company.remove();
 
  res.status (200).json ({
    success: true,
    data: {},
  });
});

