const express = require('express');
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Subject = require('../models/Subject');
const router = express.Router();

// Get attendance for a student
router.get('/student', auth, async (req, res) => {
  try {
    const { subjectId, startDate, endDate } = req.query;
    
    let query = { student: req.user.id };
    if (subjectId) query.subject = subjectId;
    if (startDate && endDate) {
      query.date = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }
    
    const attendance = await Attendance.find(query)
      .populate('subject', 'subjectName subjectCode')
      .sort({ date: -1 });
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance summary by subject
router.get('/summary', auth, async (req, res) => {
  try {
    const subjects = await Subject.find({
      department: req.user.department,
      year: req.user.year,
      semester: req.user.semester
    });
    
    const summary = [];
    
    for (const subject of subjects) {
      const totalClasses = await Attendance.countDocuments({ subject: subject._id });
      const attendedClasses = await Attendance.countDocuments({ 
        student: req.user.id, 
        subject: subject._id, 
        status: 'Present' 
      });
      
      const attendancePercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
      
      summary.push({
        subject: subject.subjectName,
        subjectCode: subject.subjectCode,
        totalClasses,
        attendedClasses,
        attendancePercentage: attendancePercentage.toFixed(2)
      });
    }
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark attendance (for faculty)
router.post('/', auth, async (req, res) => {
  try {
    const { studentId, subjectId, date, status } = req.body;
    
    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      student: studentId,
      subject: subjectId,
      date: new Date(date)
    });
    
    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for this date' });
    }
    
    const attendance = new Attendance({
      student: studentId,
      subject: subjectId,
      date: new Date(date),
      status
    });
    
    await attendance.save();
    await attendance.populate('student', 'name rollNo');
    await attendance.populate('subject', 'subjectName');
    
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk mark attendance (for faculty)
router.post('/bulk', auth, async (req, res) => {
  try {
    const { subjectId, date, attendanceData } = req.body;
    
    const results = [];
    
    for (const data of attendanceData) {
      // Check if attendance already exists for this date
      const existingAttendance = await Attendance.findOne({
        student: data.studentId,
        subject: subjectId,
        date: new Date(date)
      });
      
      if (existingAttendance) {
        results.push({
          studentId: data.studentId,
          status: 'Error',
          message: 'Attendance already marked for this date'
        });
        continue;
      }
      
      const attendance = new Attendance({
        student: data.studentId,
        subject: subjectId,
        date: new Date(date),
        status: data.status
      });
      
      await attendance.save();
      results.push({
        studentId: data.studentId,
        status: 'Success',
        message: 'Attendance marked successfully'
      });
    }
    
    res.status(201).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;