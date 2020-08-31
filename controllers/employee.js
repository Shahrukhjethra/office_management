const asyncHandler = require ('../middleware/async');
const Employee = require ('../models/Employee');
const ErrorResponse = require ('../utils/errorResponse');

exports.create = asyncHandler (async (req, res, next) => {
  const employee = await Employee.create (req.body);

  res.status (200).json ({
    success: true,
    data: employee,
  });
});

exports.read = asyncHandler (async (req, res, next) => {
  const employee = await Employee.find ().populate ('company');
  res.status (200).json ({
    success: true,
    data: employee,
  });
});

exports.updateByid = asyncHandler (async (req, res, next) => {
  let employee = await Employee.findById (req.params.id);
  if (!employee) {
    return next (
      new ErrorResponse (`No company with the id of ${req.params.id}`, 404)
    );
  }

  employee = await Employee.findByIdAndUpdate (req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status (200).json ({
    success: true,
    data: employee,
  });
});

exports.deleteByid = asyncHandler (async (req, res, next) => {
  let employee = await Employee.findById (req.params.id);
  if (!employee) {
    return next (
      new ErrorResponse (`No company with the id of ${req.params.id}`, 404)
    );
  }
  await employee.remove ();

  res.status (200).json ({
    success: true,
    data: {},
  });
});
