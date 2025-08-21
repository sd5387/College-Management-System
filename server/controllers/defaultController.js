const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');

// Get defaulter list (students with attendance below threshold)
exports.getDefaulterList = async (req, res) => {
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
};

// Get defaulter list for a specific subject
exports.getDefaulterListBySubject = async (req, res) => {
  try {
    const { threshold = 75 } = req.query;
    const { subjectId } = req.params;
    
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    const students = await Student.find({
      department: subject.department,
      year: subject.year,
      semester: subject.semester
    });
    
    const defaulterList = [];
    
    for (const student of students) {
      const totalClasses = await Attendance.countDocuments({ subject: subjectId });
      const attendedClasses = await Attendance.countDocuments({ 
        student: student._id, 
        subject: subjectId, 
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
    
    res.json(defaulterList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance statistics for dashboard
exports.getAttendanceStatistics = async (req, res) => {
  try {
    const subjects = await Subject.find({
      department: req.user.department,
      year: req.user.year,
      semester: req.user.semester
    });
    
    const statistics = [];
    let totalDefaulters = 0;
    
    for (const subject of subjects) {
      const students = await Student.find({
        department: subject.department,
        year: subject.year,
        semester: subject.semester
      });
      
      let subjectDefaulters = 0;
      
      for (const student of students) {
        const totalClasses = await Attendance.countDocuments({ subject: subject._id });
        const attendedClasses = await Attendance.countDocuments({ 
          student: student._id, 
          subject: subject._id, 
          status: 'Present' 
        });
        
        const attendancePercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
        
        if (attendancePercentage < 75) {
          subjectDefaulters++;
          totalDefaulters++;
        }
      }
      
      statistics.push({
        subject: subject.subjectName,
        subjectCode: subject.subjectCode,
        totalStudents: students.length,
        defaulters: subjectDefaulters
      });
    }
    
    res.json({
      statistics,
      totalDefaulters,
      totalSubjects: subjects.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};