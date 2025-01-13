const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['https://tjtminbox.github.io', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Accept', 'Cache-Control']
}));
app.use(bodyParser.json({ limit: '50mb' }));

// Serve screenshots directory
app.use('/screenshots', express.static(path.join(__dirname, 'screenshots')));

// Welcome page
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Screenshot PWA API</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        background: #f0f0f0;
                    }
                    .container {
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    h1 { color: #333; }
                    .status { color: #4CAF50; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Screenshot PWA API</h1>
                    <p class="status">✅ Server is running</p>
                    <p>This is the API server for the Screenshot PWA application.</p>
                    <p>Frontend URL: <a href="https://tjtminbox.github.io/screenshot_pwa/">https://tjtminbox.github.io/screenshot_pwa/</a></p>
                    <h2>Endpoints:</h2>
                    <ul>
                        <li><code>/screenshots</code> - GET - List all screenshots</li>
                        <li><code>/save-screenshot</code> - POST - Save a new screenshot</li>
                    </ul>
                </div>
            </body>
        </html>
    `);
});

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
}

// Endpoint untuk menyimpan screenshot
app.post('/save-screenshot', (req, res) => {
    const { imageData, timestamp, browser } = req.body;
    
    if (!imageData) {
        return res.status(400).json({ error: 'No image data provided' });
    }

    try {
        // Remove header from base64 string if present
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
        const fileName = `screenshot_${timestamp}_${browser || 'unknown'}.png`;
        const filePath = path.join(screenshotsDir, fileName);

        // Write file using buffer
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        console.log(`Screenshot saved: ${fileName}`);
        
        // Return the URL to access the screenshot
        const screenshotUrl = `/screenshots/${fileName}`;
        res.json({ 
            success: true, 
            fileName,
            url: screenshotUrl
        });
    } catch (error) {
        console.error('Error saving screenshot:', error);
        res.status(500).json({ error: 'Failed to save screenshot', details: error.message });
    }
});

// Endpoint untuk mendapatkan daftar screenshot
app.get('/screenshots', (req, res) => {
    try {
        const files = fs.readdirSync(screenshotsDir)
            .filter(file => file.endsWith('.png'))
            .map(file => ({
                name: file,
                url: `/screenshots/${file}`,
                timestamp: file.split('_')[1]
            }));
        res.json({ screenshots: files });
    } catch (error) {
        console.error('Error reading screenshots directory:', error);
        res.status(500).json({ error: 'Failed to read screenshots', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
