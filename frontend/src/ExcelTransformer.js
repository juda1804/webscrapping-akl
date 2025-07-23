import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  CircularProgress, 
  Paper,
  Alert,
  Snackbar
} from '@mui/material';
import * as XLSX from 'xlsx';

function ExcelTransformer() {
  const [medicoLectura, setMedicoLectura] = useState('TBD');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setSelectedFile(file);
      setSnackbar({ open: true, message: 'Archivo seleccionado correctamente', severity: 'success' });
    } else {
      setSnackbar({ open: true, message: 'Por favor selecciona un archivo Excel (.xlsx)', severity: 'error' });
    }
  };

  const transformXlsx = async () => {
    if (!selectedFile) {
      setSnackbar({ open: true, message: 'Por favor selecciona un archivo primero', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const data = await readFileAsArrayBuffer(selectedFile);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert the worksheet to JSON, specifying the header row (row 2)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1, // Get raw rows as arrays
        defval: '', // Default value for empty cells
      });

      // Row 2 (index 1) contains the column names
      const columnNames = jsonData[1];
      // Data starts from row 3 (index 2)
      const rows = jsonData.slice(2);

      // Map each row to an object using the column names
      const rowObjects = rows.map(row => {
        const obj = {};
        columnNames.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj;
      });

      // Define the output columns and their mapping from the input
      const outputColumns = [
        'Nombre del paciente',
        'Número de documento',
        'Estudios',
        'Medico que realiza lectura',
        'Fecha de la lectura',
        'Hora del dictado',
        'Modalidad',
        'Prioridad',
        'Estado',
        'Edad',
        'Procedencia',
        'Caso crítico',
        'Sede',
        'Valor unitario',
      ];

      // Transform the data and ensure the order of keys matches outputColumns
      const transformedRows = rowObjects.map(row => {
        const obj = {};
        outputColumns.forEach(col => {
          if (col === 'Medico que realiza lectura') {
            obj[col] = medicoLectura || 'TBD';
          } else if (col === 'Valor unitario') {
            obj[col] = 999;
          } else {
            obj[col] = row[col] || '';
          }
        });
        return obj;
      });

      // Create a new worksheet and workbook
      const upperHeaders = outputColumns.map(h => h.toUpperCase());
      const newWorksheet = XLSX.utils.json_to_sheet(transformedRows, { header: outputColumns });
      // Overwrite header row with uppercase headers
      XLSX.utils.sheet_add_aoa(newWorksheet, [upperHeaders], { origin: 'A1' });

      // Calculate and set column widths
      const allRows = [outputColumns, ...transformedRows.map(row => outputColumns.map(col => String(row[col] ?? '')))];
      const colWidths = outputColumns.map((col, colIdx) => {
        // Find the max length in this column (header or any row)
        const maxLen = allRows.reduce((max, row) => {
          const cell = row[colIdx] || '';
          return Math.max(max, cell.length);
        }, 0);
        // Add a little extra padding
        return { wch: maxLen + 2 };
      });
      newWorksheet['!cols'] = colWidths;

      // Add autofilter to the header row
      const lastColLetter = 'N'; // 14 columns, so column N
      const lastRow = transformedRows.length + 1; // header + data
      newWorksheet['!autofilter'] = { ref: `A1:${lastColLetter}${lastRow}` };

      const newWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Transformed');

      // Generate the output file
      const outputFileName = `${selectedFile.name.replace('.xlsx', '')}-r.xlsx`;
      XLSX.writeFile(newWorkbook, outputFileName);
      
      setSnackbar({ open: true, message: 'Archivo transformado y descargado exitosamente', severity: 'success' });
    } catch (error) {
      console.error('Error transforming file:', error);
      setSnackbar({ open: true, message: 'Error al transformar el archivo', severity: 'error' });
    }
    setLoading(false);
  };

  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, minWidth: 400 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Transformador de Excel
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Médico que realiza lectura"
            value={medicoLectura}
            onChange={(e) => setMedicoLectura(e.target.value)}
            fullWidth
            helperText="Nombre del médico que realizará la lectura"
          />

          <Box>
            <input
              accept=".xlsx"
              style={{ display: 'none' }}
              id="excel-file-input"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="excel-file-input">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                sx={{ mb: 1 }}
              >
                Seleccionar archivo Excel
              </Button>
            </label>
            {selectedFile && (
              <Typography variant="body2" color="text.secondary">
                Archivo seleccionado: {selectedFile.name}
              </Typography>
            )}
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={transformXlsx}
            disabled={loading || !selectedFile}
            fullWidth
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Transformar y Descargar'}
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

export default ExcelTransformer; 