const express = require('express');
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const router = express.Router();

// Get defaulter list (students with attendance below threshold)
router.get('/', auth, async (req, res) => {
  try {
    const { threshold = 75, subjectId } = req.query;
    
    let subjects;
    if (subjectId) {
      // Get specific subject
      const subject = await Subject.findById(subjectId);
      subjects = subject ? [subject] : [];
    } else {
      // Get all subjects for the student's department, year, and semester
      subjects = await Subject.find({
        department: req.user.department,
        year: req.user.year,
        semester: req.user.semester
      });
    }
    
    const defaulterList = [];
    
    for (const subject of subjects) {
      // Get all students for this subject
      const students = await Student.find({
        department: subject.department,
        year: subject.year,
        semester: subject.semester
      });
      
      for (const student of students) {
        const totalClasses = await Attendance.countDocuments({ subject: subject._id });
        const attendedClasses = await Attendance.countDocuments({ 
          student: student._id, 
          subject: subject._id, 
          status: 'Present' 
        });
        
        const attendancePercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
        
        if (attendancePercentage < threshold) {
          defaulterList.push({
            student: {
              id: student._id,
              rollNo: student.rollNo,
              name: student.name,
              email: student.email
            },
            subject: {
              id: subject._id,
              subjectCode: subject.subjectCode,
              subjectName: subject.subjectName
            },
            totalClasses,
            attendedClasses,
            attendancePercentage: attendancePercentage.toFixed(2)
          });
        }
      }
    }
    
    res.json(defaulterList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;