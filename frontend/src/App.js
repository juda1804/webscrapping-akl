import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  CircularProgress, 
  Paper,
  Tabs,
  Tab,
  Snackbar,
  Alert
} from '@mui/material';
import ExcelTransformer from './ExcelTransformer';
import './App.css';

function ScraperTab() {
  const [form, setForm] = useState({ username: '', cedula: '', fechaInicio: '', fechaFin: '' });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validate all required fields
    if (!form.username || !form.cedula || !form.fechaInicio || !form.fechaFin) {
      console.log('Form validation failed:', form);
      setSnackbar({ 
        open: true, 
        message: 'Por favor completa todos los campos requeridos', 
        severity: 'error' 
      });
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Sending scraper request with data:', form);
      
      // Fire and forget - don't wait for response
      fetch('/api/risivys-scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }).catch(err => {
        console.error('Error sending scraper request:', err);
        // Don't show error to user since it's fire and forget
      });

      // Immediately show success message
      setSnackbar({ 
        open: true, 
        message: 'Scraper iniciado exitosamente. El archivo se guardará en la carpeta downloads.', 
        severity: 'success' 
      });
      
      // Reset form
      setForm({ username: '', cedula: '', fechaInicio: '', fechaFin: '' });
      
    } catch (err) {
      console.error('Network error:', err);
      setSnackbar({ 
        open: true, 
        message: 'Error de conexión al iniciar el scraper', 
        severity: 'error' 
      });
    }
    
    setLoading(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <Paper elevation={3} sx={{ p: 4, minWidth: 350 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Risivys Scraper
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            name="username"
            label="Username"
            value={form.username}
            onChange={handleChange}
            required
            fullWidth
            autoFocus
          />
          <TextField
            name="cedula"
            label="Cedula"
            value={form.cedula}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            name="fechaInicio"
            label="Fecha de inicio"
            type="date"
            value={form.fechaInicio}
            onChange={handleChange}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            name="fechaFin"
            label="Fecha de fin"
            type="date"
            value={form.fechaFin}
            onChange={handleChange}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={loading} 
            fullWidth 
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Scraper'}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box className="App" sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Risivys Scraper" />
          <Tab label="Transformador de Excel" />
        </Tabs>
      </Box>
      
      <Box sx={{ p: 2 }}>
        {activeTab === 0 && <ScraperTab />}
        {activeTab === 1 && <ExcelTransformer />}
      </Box>
    </Box>
  );
}

export default App;
