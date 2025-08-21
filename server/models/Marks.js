const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  midSem: {
    type: Number,
    min: 0,
    max: 100
  },
  sessional: {
    type: Number,
    min: 0,
    max: 100
  },
  internal: {
    type: Number,
    min: 0,
    max: 100
  },
  total: {
    type: Number,
    min: 0,
    max: 100
  }
});

// Compound index to prevent duplicate marks records
marksSchema.index({ student: 1, subject: 1 }, { unique: true });

// Calculate total before saving
marksSchema.pre('save', function(next) {
  this.total = (this.midSem * 0.4) + (this.sessional * 0.3) + (this.internal * 0.3);
  next();
});

module.exports = mongoose.model('Marks', marksSchema);