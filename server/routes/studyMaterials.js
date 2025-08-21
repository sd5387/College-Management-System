const express = require('express');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const StudyMaterial = require('../models/StudyMaterial');
const Subject = require('../models/Subject');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check if file is PDF
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Get all study materials
router.get('/', auth, async (req, res) => {
  try {
    const { subjectId, fileType } = req.query;
    
    let query = {};
    if (subjectId) query.subject = subjectId;
    if (fileType) query.fileType = fileType;
    
    const materials = await StudyMaterial.find(query)
      .populate('subject', 'subjectName subjectCode')
      .populate('uploadedBy', 'name rollNo')
      .sort({ createdAt: -1 });
    
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get study materials by subject
router.get('/subject/:subjectId', auth, async (req, res) => {
  try {
    const materials = await StudyMaterial.find({ subject: req.params.subjectId })
      .populate('subject', 'subjectName subjectCode')
      .populate('uploadedBy', 'name rollNo')
      .sort({ createdAt: -1 });
    
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload study material
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, description, subjectId, fileType } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }
    
    const material = new StudyMaterial({
      title,
      description,
      subject: subjectId,
      fileUrl: req.file.path,
      fileType,
      uploadedBy: req.user.id
    });
    
    await material.save();
    await material.populate('subject', 'subjectName subjectCode');
    await material.populate('uploadedBy', 'name rollNo');
    
    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Download study material
router.get('/download/:id', auth, async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    const filePath = path.join(__dirname, '..', material.fileUrl);
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete study material
router.delete('/:id', auth, async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Check if user is the uploader
    if (material.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this file' });
    }
    
    await StudyMaterial.findByIdAndDelete(req.params.id);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;