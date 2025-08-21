const Student = require('../models/Student');
const jwt = require('jsonwebtoken');

// Student registration
exports.register = async (req, res) => {
  try {
    const { rollNo, name, email, password, department, year, semester, contact, address } = req.body;
    
    // Check if student already exists
    const existingStudent = await Student.findOne({ $or: [{ email }, { rollNo }] });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student already exists with this email or roll number' });
    }
    
    // Create new student
    const student = new Student({
      rollNo,
      name,
      email,
      password,
      department,
      year,
      semester,
      contact,
      address
    });
    
    await student.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: student._id, email: student.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      student: {
        id: student._id,
        rollNo: student.rollNo,
        name: student.name,
        email: student.email,
        department: student.department,
        year: student.year,
        semester: student.semester,
        contact: student.contact,
        address: student.address
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Student login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if student exists
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isPasswordValid = await student.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: student._id, email: student.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      student: {
        id: student._id,
        rollNo: student.rollNo,
        name: student.name,
        email: student.email,
        department: student.department,
        year: student.year,
        semester: student.semester,
        contact: student.contact,
        address: student.address
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};