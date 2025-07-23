const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

app.post('/api/risivys-scrape', async (req, res) => {
  const { username, cedula, fechaInicio, fechaFin } = req.body;
  
  console.log('Received scraper request:', { username, cedula, fechaInicio, fechaFin });
  
  if (!username || !cedula || !fechaInicio || !fechaFin) {
    console.log('Missing required fields:', { username, cedula, fechaInicio, fechaFin });
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Generate filename
  const today = new Date().toISOString().split('T')[0];
  const customFilename = `${username}-leidos-${today}-r.xlsx`;
  const outputPath = path.join(__dirname, 'downloads', customFilename);

  // Remove old file if exists
  if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

  // Run the scraper asynchronously
  const scraperArgs = [
    path.join(__dirname, 'examples/risivys-scraper.js'), 
    username, 
    cedula, 
    'TBD', // Default medico value since it's handled in Excel transformer
    fechaInicio, 
    fechaFin
  ];
  
  console.log('Starting scraper with args:', scraperArgs);
  
  const child = spawn('node', scraperArgs, { stdio: 'inherit' });

  child.on('close', (code) => {
    console.log(`Scraper process exited with code: ${code}`);
    if (code !== 0) {
      console.log('Scraper failed');
    } else {
      console.log('Scraper completed successfully');
    }
  });

  // Immediately return success response
  res.json({ 
    success: true, 
    message: 'Scraper iniciado exitosamente'
  });
});

app.listen(3001, () => console.log('Server running on port 3001')); 