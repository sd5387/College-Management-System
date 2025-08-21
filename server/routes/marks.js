const express = require('express');
const auth = require('../middleware/auth');
const Marks = require('../models/Marks');
const Subject = require('../models/Subject');
const router = express.Router();

// Get marks for a student
router.get('/student', auth, async (req, res) => {
  try {
    const marks = await Marks.find({ student: req.user.id })
      .populate('subject', 'subjectName subjectCode credits');
    
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get marks for a specific subject
router.get('/subject/:subjectId', auth, async (req, res) => {
  try {
    const marks = await Marks.findOne({ 
      student: req.user.id, 
      subject: req.params.subjectId 
    }).populate('subject', 'subjectName subjectCode');
    
    if (!marks) {
      return res.status(404).json({ message: 'Marks not found for this subject' });
    }
    
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add or update marks (for faculty)
router.post('/', auth, async (req, res) => {
  try {
    const { studentId, subjectId, midSem, sessional, internal } = req.body;
    
    let marks = await Marks.findOne({ student: studentId, subject: subjectId });
    
    if (marks) {
      // Update existing marks
      marks.midSem = midSem;
      marks.sessional = sessional;
      marks.internal = internal;
    } else {
      // Create new marks record
      marks = new Marks({
        student: studentId,
        subject: subjectId,
        midSem,
        sessional,
        internal
      });
    }
    
    await marks.save();
    await marks.populate('student', 'name rollNo');
    await marks.populate('subject', 'subjectName');
    
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;