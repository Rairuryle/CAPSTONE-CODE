const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const router = express.Router();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

// Set up multer for file upload
const upload = multer({ dest: 'uploads/' });

// Import the controller function for processing the CSV data
const { processImportedData } = require('../controllers/importController');

// Define the CSV upload route
router.post('/import-csv', upload.single('csvFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = req.file.path;
    const importedData = [];

    // Parse the CSV file and collect the data
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            importedData.push(row);  // Store each row of the CSV in the importedData array
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
            
            // Delegate to the controller to process the data and save it to the database
            processImportedData(importedData, req, res);  // Pass req and res to the controller

            // Optionally, delete the uploaded file after processing
            fs.unlinkSync(filePath);  // Clean up the uploaded file after processing
        })
        .on('error', (err) => {
            console.error('Error reading CSV:', err);
            res.status(500).send('Error processing CSV file.');
        });
});

module.exports = router;
