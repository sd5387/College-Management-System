const StudyMaterial = require('../models/StudyMaterial');
const Subject = require('../models/Subject');
const path = require('path');
const fs = require('fs');

// Get all study materials
exports.getAllMaterials = async (req, res) => {
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
};

// Get study materials by subject
exports.getMaterialsBySubject = async (req, res) => {
  try {
    const materials = await StudyMaterial.find({ subject: req.params.subjectId })
      .populate('subject', 'subjectName subjectCode')
      .populate('uploadedBy', 'name rollNo')
      .sort({ createdAt: -1 });
    
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload study material
exports.uploadMaterial = async (req, res) => {
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
};

// Download study material
exports.downloadMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    const filePath = path.join(__dirname, '..', material.fileUrl);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete study material
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Check if user is the uploader or admin
    if (material.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this file' });
    }
    
    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', material.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    await StudyMaterial.findByIdAndDelete(req.params.id);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get material by ID
exports.getMaterialById = async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id)
      .populate('subject', 'subjectName subjectCode')
      .populate('uploadedBy', 'name rollNo');
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    
    res.json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};