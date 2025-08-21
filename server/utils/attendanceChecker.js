const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const { sendLowAttendanceEmail } = require('./emailService');

const checkLowAttendance = async () => {
  try {
    const students = await Student.find();
    const subjects = await Subject.find();
    
    for (const student of students) {
      for (const subject of subjects) {
        // Check if student belongs to this subject's department, year, and semester
        if (student.department === subject.department && 
            student.year === subject.year && 
            student.semester === subject.semester) {
          
          // Calculate attendance percentage for this subject
          const totalClasses = await Attendance.countDocuments({ subject: subject._id });
          const attendedClasses = await Attendance.countDocuments({ 
            student: student._id, 
            subject: subject._id, 
            status: 'Present' 
          });
          
          const attendancePercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
          
          // If attendance is below 75%, send email alert
          if (attendancePercentage < 75) {
            await sendLowAttendanceEmail(student, subject, attendancePercentage.toFixed(2));
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking attendance:', error);
  }
};

module.exports = { checkLowAttendance };