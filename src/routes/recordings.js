const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Recording } = require("../models/Recording");

// Ensure uploads directory exists
const uploadsPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'recording-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'), false);
    }
  }
});

// GET all recordings
router.get("/", async (req, res) => {
  try {
    const recordings = await Recording.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({
      success: true,
      data: recordings,
      count: recordings.length
    });
  } catch (error) {
    console.error('Error fetching recordings:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch recordings' 
    });
  }
});

// GET single recording
router.get("/:id", async (req, res) => {
  try {
    const recording = await Recording.findByPk(req.params.id);
    if (!recording) {
      return res.status(404).json({ 
        success: false, 
        error: 'Recording not found' 
      });
    }
    res.json({
      success: true,
      data: recording
    });
  } catch (error) {
    console.error('Error fetching recording:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch recording' 
    });
  }
});

// POST upload recording
router.post("/", upload.single("recording"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: "No file uploaded" 
      });
    }

    const recording = await Recording.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
    });

    res.status(201).json({ 
      success: true,
      message: "Recording uploaded successfully", 
      data: recording 
    });
  } catch (error) {
    console.error('Sarver Error uploading recording:', error);
    
    // Clean up file if database save failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload recording' 
    });
  }
});

// DELETE recording
router.delete("/:id", async (req, res) => {
  try {
    const recording = await Recording.findByPk(req.params.id);
    if (!recording) {
      return res.status(404).json({ 
        success: false, 
        error: 'Recording not found' 
      });
    }

    // Delete file from filesystem
    const filePath = path.join(uploadsPath, recording.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await recording.destroy();

    res.json({
      success: true,
      message: 'Recording deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting recording:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete recording' 
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 50MB.'
      });
    }
  }
  
  res.status(400).json({
    success: false,
    error: error.message || 'Upload failed'
  });
});

module.exports = router;