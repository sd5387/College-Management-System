const express = require('express');
const auth = require('../middleware/auth');
const Student = require('../models/Student');
const router = express.Router();

// Get all students (for admin purposes)
router.get('/', auth, async (req, res) => {
  try {
    const students = await Student.find().select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current student profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update student profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, contact, address } = req.body;
    
    const student = await Student.findByIdAndUpdate(
      req.user.id,
      { name, contact, address },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;