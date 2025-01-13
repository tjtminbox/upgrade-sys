const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Accept', 'Cache-Control']
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('web')); // Serve Flutter web build
app.use('/screenshots', express.static(path.join(__dirname, 'screenshots'))); // Serve screenshots directory

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
