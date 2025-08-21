const express = require('express');
const auth = require('../middleware/auth');
const Subject = require('../models/Subject');
const router = express.Router();

// Get all subjects
router.get('/', auth, async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get subjects by department, year, and semester
router.get('/:department/:year/:semester', auth, async (req, res) => {
  try {
    const { department, year, semester } = req.params;
    const subjects = await Subject.find({ department, year, semester });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new subject (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;