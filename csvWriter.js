const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');

// Function to append data to a CSV file
function appendDataToCSV(filePath, data) {
    try {
        const fileExists = fs.existsSync(filePath); // Check if the file exists

        const opts = { header: !fileExists }; // Add headers only if file doesn't exist
        const csv = parse(data, opts); // Convert JSON to CSV

        // Append CSV data to file
        fs.appendFileSync(filePath, csv + '\n', 'utf8');
        console.log(`Data successfully written to ${filePath}`);
    } catch (error) {
        console.error('Error writing to CSV file:', error.message);
    }
}

module.exports = { appendDataToCSV };
