const express = require('express');
const bodyParser = require('body-parser');
const { scrapeMultiplePages } = require('./main');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));  // Serve static files like CSV

// HTML template with inline CSS
const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cylex Scraping Dashboard</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #f4f4f9;
        }

        #app {
            max-width: 600px;
            margin: 30px auto;
            background: #fff;
            padding: 20px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        h1 {
            text-align: center;
            color: #333;
        }

        form {
            display: flex;
            flex-direction: column;
        }

        label {
            margin-top: 10px;
        }

        input, button {
            padding: 10px;
            margin-top: 5px;
        }

        button {
            background: #007bff;
            color: white;
            border: none;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div id="app">
        <h1>Cylex Scraping Dashboard</h1>
        <form action="/scrape" method="POST">
            <label for="url">Enter URL:</label>
            <input type="text" id="url" name="url" required>
            <label for="pages">Number of Pages:</label>
            <input type="number" id="pages" name="pages" required>
            <button type="submit">Start Scraping</button>
        </form>
    </div>
</body>
</html>
`;

// Serve the HTML template
app.get('/', (req, res) => {
    res.send(htmlTemplate);
});

// Handle form submission
app.post('/scrape', async (req, res) => {
    const { url, pages } = req.body;

    try {
        const result = await scrapeMultiplePages(url, parseInt(pages, 10));
        res.send(`
            <h1>Scraping Completed</h1>
            <p>Scraped data from: <strong>${url}</strong></p>
            <p>Number of pages: <strong>${pages}</strong></p>
            <pre>${JSON.stringify(result, null, 2)}</pre>
            <p><a href="/scraped_data.csv">Click Here to Open CSV File</a></p>
            <a href="/">Go back</a>
        `);
    } catch (error) {
        console.error('Error scraping:', error);
        res.status(500).send('<h1>Error occurred during scraping</h1><a href="/">Go back</a>');
    }
});

// Serve CSV file for download
app.get('/scraped_data.csv', (req, res) => {
    res.sendFile(path.join(__dirname, 'scraped_data.csv'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
