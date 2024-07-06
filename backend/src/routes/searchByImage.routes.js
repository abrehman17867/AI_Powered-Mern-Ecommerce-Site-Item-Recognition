// const express = require('express');
// const multer = require('multer');
// const { spawn } = require('child_process');
// const path = require('path');
// const router = express.Router();

// /// Set up multer for file uploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploadsImage/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname));
//     },
// });

// const upload = multer({ storage });

// // Endpoint to handle image upload and prediction
// router.post('/upload', upload.single('image'), (req, res) => {
//     const imagePath = req.file.path;
//     const imageName = req.file.filename;
//     const pythonProcess = spawn('python', ['predict.py', imagePath]);

//     pythonProcess.stdout.on('data', (data) => {
//         const prediction = data.toString().trim();
//         // console.log(prediction)
//         res.json({ prediction });
//     });

//     pythonProcess.stderr.on('data', (data) => {
//         console.error(`stderr: ${data}`);
//     });

//     pythonProcess.on('close', (code) => {
//         console.log(`child process exited with code ${code}`);
//     });
// });

// module.exports = router;


