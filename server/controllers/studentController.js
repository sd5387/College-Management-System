const Student = require('../models/Student');

// Get all students (for admin purposes)
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current student profile
exports.getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update student profile
exports.updateProfile = async (req, res) => {
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
};

// Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};