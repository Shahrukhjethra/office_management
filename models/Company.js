const mongoose = require ('mongoose');

const CompanySchema = new mongoose.Schema ({
  companyName: {
    type: String,
    required: [true, 'Please add a companyName'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model ('Company', CompanySchema);
