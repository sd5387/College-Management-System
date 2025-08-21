const Marks = require('../models/Marks');
const Subject = require('../models/Subject');

// Get marks for a student
exports.getStudentMarks = async (req, res) => {
  try {
    const marks = await Marks.find({ student: req.user.id })
      .populate('subject', 'subjectName subjectCode credits');
    
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get marks for a specific subject
exports.getMarksBySubject = async (req, res) => {
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
};

// Add or update marks (for faculty)
exports.updateMarks = async (req, res) => {
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
};

// Get marks for all students in a subject (for faculty)
exports.getMarksBySubjectForFaculty = async (req, res) => {
  try {
    const marks = await Marks.find({ subject: req.params.subjectId })
      .populate('student', 'name rollNo')
      .populate('subject', 'subjectName subjectCode');
    
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk update marks (for faculty)
exports.bulkUpdateMarks = async (req, res) => {
  try {
    const { subjectId, marksData } = req.body;
    
    const results = [];
    
    for (const data of marksData) {
      let marks = await Marks.findOne({ student: data.studentId, subject: subjectId });
      
      if (marks) {
        // Update existing marks
        marks.midSem = data.midSem;
        marks.sessional = data.sessional;
        marks.internal = data.internal;
      } else {
        // Create new marks record
        marks = new Marks({
          student: data.studentId,
          subject: subjectId,
          midSem: data.midSem,
          sessional: data.sessional,
          internal: data.internal
        });
      }
      
      await marks.save();
      results.push({
        studentId: data.studentId,
        status: 'Success',
        message: 'Marks updated successfully'
      });
    }
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};