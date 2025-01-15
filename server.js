const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const screenshotsDir = path.join(__dirname, 'screenshots');

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
}

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve screenshots directory
app.use('/screenshots', express.static(screenshotsDir));

// API endpoint to get list of screenshots with metadata
app.get('/screenshots', async (req, res) => {
    try {
        const files = await fsPromises.readdir(screenshotsDir);
        const screenshots = await Promise.all(files.map(async (filename) => {
            const stats = await fsPromises.stat(path.join(screenshotsDir, filename));
            const parts = filename.split('_');
            return {
                filename,
                url: `/screenshots/${filename}`,
                date: parts[1],
                time: parts[2],
                browser: parts[3].split('.')[0],
                size: stats.size,
                timestamp: stats.mtime
            };
        }));
        
        // Sort by newest first
        screenshots.sort((a, b) => b.timestamp - a.timestamp);
        
        res.json(screenshots);
    } catch (error) {
        console.error('Error reading screenshots directory:', error);
        res.status(500).json({ error: 'Failed to read screenshots' });
    }
});

// Save screenshot endpoint
app.post('/screenshot', async (req, res) => {
    try {
        const { imageData, browser } = req.body;
        if (!imageData) {
            return res.status(400).json({ error: 'No image data provided' });
        }

        const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
        const filename = `screenshot_${timestamp}_${browser}.png`;
        const filepath = path.join(screenshotsDir, filename);

        await fsPromises.writeFile(filepath, base64Data, 'base64');
        res.json({ success: true, filename });
    } catch (error) {
        console.error('Error saving screenshot:', error);
        res.status(500).json({ error: 'Failed to save screenshot' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
