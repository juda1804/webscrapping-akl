const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

app.post('/api/risivys-scrape', async (req, res) => {
  const { username, cedula, medico, fechaInicio, fechaFin } = req.body;
  if (!username || !cedula || !medico || !fechaInicio || !fechaFin) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Paths
  const scriptPath = path.join(__dirname, 'examples/risivys-scraper.js');
  const today = new Date().toISOString().split('T')[0];
  const customFilename = `${username}-leidos-${today}-r.xlsx`;
  const outputPath = path.join(__dirname, 'downloads', customFilename);

  // Remove old file if exists
  if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

  // Run the scraper
  const child = spawn('node', [scriptPath, username, cedula, medico, fechaInicio, fechaFin], { stdio: 'inherit' });

  child.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: 'Scraper failed' });
    }
    // Wait for file to exist, then send
    fs.access(outputPath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(500).json({ error: 'File not found' });
      }
      res.download(outputPath, customFilename);
    });
  });
});

app.listen(3001, () => console.log('Server running on port 3001')); 