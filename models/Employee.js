const mongoose = require ('mongoose');

const EmployeeSchema = new mongoose.Schema ({
  employeeName: {
    type: String,
    required: [true, 'Please add a employeeName'],
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
  },
  role: {
    type: String,
    enum: ['Manager', 'Admin', 'Developer'],
    default: 'Developer',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model ('Employee', EmployeeSchema);
