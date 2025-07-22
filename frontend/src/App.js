import React, { useState } from 'react';
import { Box, TextField, Button, Typography, CircularProgress, Paper } from '@mui/material';
import './App.css';

function App() {
  const [form, setForm] = useState({ username: '', cedula: '', medico: '', fechaInicio: '', fechaFin: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/risivys-scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (response.ok) {
        const blob = await response.blob();
        const today = new Date().toISOString().split('T')[0];
        const filename = `${form.username}-leidos-${today}-r.xlsx`;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Error running scraper');
      }
    } catch (err) {
      alert('Network or server error');
    }
    setLoading(false);
  };

  return (
    <Box className="App" sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            name="medico"
            label="Nombre del médico"
            value={form.medico}
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
          <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth sx={{ mt: 2 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Run Scraper'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default App;
