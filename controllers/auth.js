const crypto = require ('crypto');
const ErrorResponse = require ('../utils/errorResponse');
const asyncHandler = require ('../middleware/async');
const sendEmail = require ('../utils/sendEmail');
const User = require ('../models/User');
const path = require ('path');
// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler (async (req, res, next) => {
  const {firstName, lastName, phoneNumber, email, password, role} = req.body;

  // Create user
  const user = await User.create ({
    firstName,
    lastName,
    phoneNumber,
    email,
    password,
    role,
  });
  sendTokenResponse (user, 200, res);
});

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler (async (req, res, next) => {
  const {email, password} = req.body;

  // Validate emil & password
  if (!email || !password) {
    return next (
      new ErrorResponse ('Please provide an email and password', 400)
    );
  }

  // Check for user
  const user = await User.findOne ({email}).select ('+password');

  if (!user) {
    return next (new ErrorResponse ('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword (password);

  if (!isMatch) {
    return next (new ErrorResponse ('Invalid credentials', 401));
  }
  sendTokenResponse (user, 200, res);
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Private
exports.logout = asyncHandler (async (req, res, next) => {
  res.cookie ('token', 'none', {
    expires: new Date (Date.now () + 10 * 1000),
    httpOnly: true,
  });

  res.status (200).json ({
    success: true,
    data: {},
  });
});

// @desc      Get current logged in user
// @route     POST /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler (async (req, res, next) => {
  const user = await User.findById (req.user.id);

  res.status (200).json ({
    success: true,
    data: user,
  });
});

// @desc      Update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
exports.updateDetails = asyncHandler (async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate (req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status (200).json ({
    success: true,
    data: user,
  });
});

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler (async (req, res, next) => {
  const user = await User.findById (req.user.id).select ('+password');

  // Check current password
  if (!await user.matchPassword (req.body.currentPassword)) {
    return next (new ErrorResponse ('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save ();

  sendTokenResponse (user, 200, res);
});

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler (async (req, res, next) => {
  const user = await User.findOne ({email: req.body.email});

  if (!user) {
    return next (new ErrorResponse ('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken ();

  await user.save ({validateBeforeSave: false});

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get ('host')}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail ({
      email: user.email,
      subject: 'Password reset token',
      message,
    });

    res.status (200).json ({success: true, data: 'Email sent'});
  } catch (err) {
    console.log (err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save ({validateBeforeSave: false});

    return next (new ErrorResponse ('Email could not be sent', 500));
  }

  res.status (200).json ({
    success: true,
    data: user,
  });
});

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = asyncHandler (async (req, res, next) => {
  //console.log("resetPassword_post", JSON.parse(JSON.stringify(req.body))  );
  console.log ('resetPassword_post', req.body);

  if (req.body.password == req.body.confirm) {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash ('sha256')
      .update (req.params.resettoken)
      .digest ('hex');

    const user = await User.findOne ({
      resetPasswordToken,
      resetPasswordExpire: {$gt: Date.now ()},
    });

    if (!user) {
      return next (new ErrorResponse ('Invalid token', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save ();
    req.flash ('success', 'Success! Your password has been changed.');
  } else {
    return next (new ErrorResponse ('you password done not match with confirm password.', 400));
  }

  //sendTokenResponse (user, 200, res);
});

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
exports.viewTest = asyncHandler (async (req, res, next) => {
  console.log ('token', req.params.resettoken);

  res.render ('login.ejs', {
    token: req.params.resettoken,
  });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken ();

  const options = {
    expires: new Date (
      Date.now () + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status (statusCode).cookie ('token', token, options).json ({
    success: true,
    token,
  });
};

// @desc      Upload photo for user
// @route     PUT /api/v1/auth/:id/photo
// @access    Private
exports.userPhotoUpload = asyncHandler (async (req, res, next) => {
  const user = await User.findById (req.user.id);

  if (!user) {
    return next (
      new ErrorResponse (`User not found with id of ${req.user.id}`, 404)
    );
  }

  if (!req.files) {
    return next (new ErrorResponse (`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith ('image')) {
    return next (new ErrorResponse (`Please upload an image file`, 400));
  }

  // // Check filesize
  // if (file.size > process.env.MAX_FILE_UPLOAD) {
  //   return next (
  //     new ErrorResponse (
  //       `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
  //       400
  //     )
  //   );
  // }

  // Create custom filename
  file.name = `photo_${user._id}${path.parse (file.name).ext}`;

  file.mv (`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error (err);
      return next (new ErrorResponse (`Problem with file upload`, 500));
    }

    await User.findByIdAndUpdate (req.user.id, {photo: file.name});

    res.status (200).json ({
      success: true,
      data: file.name,
    });
  });
});
