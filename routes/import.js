const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');
const router = express.Router();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

// Use Multer's memoryStorage to keep the file in memory instead of saving it to the filesystem
const memoryStorage = multer.memoryStorage();
const sprUpload = multer({ storage: memoryStorage }).single('csvFile');
const studentUpload = multer({ storage: memoryStorage }).single('csvFile');

// Import the controller function for processing the CSV data
const { processImportedData } = require('../controllers/importController');
const { processImportedStudentData } = require('../controllers/importController');

router.post('/import-csv', sprUpload, (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const importedData = [];

    const bufferStream = Readable.from(req.file.buffer.toString());
    
    bufferStream
        .pipe(csv())
        .on('data', (row) => {
            importedData.push(row);
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
            
            processImportedData(importedData, req, res);
        })
        .on('error', (err) => {
            console.error('Error reading CSV:', err);
            res.status(500).send('Error processing CSV file.');
        });
});

router.post('/import-csv-student', studentUpload, (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const importedData = [];

    // Convert the buffer to a stream and pipe it to csv-parser
    const bufferStream = Readable.from(req.file.buffer.toString());

    bufferStream
        .pipe(csv())
        .on('data', (row) => {
            importedData.push(row);
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
            
            processImportedStudentData(importedData, req, res);
        })
        .on('error', (err) => {
            console.error('Error reading CSV:', err);
            res.status(500).send('Error processing CSV file.');
        });
});

module.exports = router;
