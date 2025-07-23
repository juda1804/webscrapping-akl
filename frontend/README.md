# Frontend - Web Scraping & Excel Transformer

This React application provides two main functionalities:

## Features

### 1. Risivys Scraper
- Web scraping functionality for Risivys platform
- Collects data based on username, cedula, doctor name, and date range
- Downloads results as Excel files

### 2. Excel Transformer
- Upload Excel files (.xlsx format)
- Transform data with predefined column structure
- Set custom doctor name for readings
- Download transformed Excel files with "-r" suffix

## Installation

```bash
npm install
```

## Development

```bash
npm start
```

The application will open at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

## Usage

### Risivys Scraper Tab
1. Fill in the required fields:
   - Username
   - Cedula
   - Doctor name
   - Start date
   - End date
2. Click "Run Scraper"
3. The Excel file will be automatically downloaded

### Excel Transformer Tab
1. Enter the doctor name who will perform the reading
2. Click "Seleccionar archivo Excel" to choose an Excel file
3. Click "Transformar y Descargar" to process and download the transformed file
4. The output file will have "-r" added to the original filename

## Dependencies

- React 19.1.0
- Material-UI 7.2.0
- XLSX 0.18.5 (for Excel file processing)

## File Structure

```
src/
├── App.js              # Main application with tabs
├── ExcelTransformer.js # Excel transformation component
└── App.css            # Styles
```

## Notes

- The Excel transformer processes files entirely in the browser
- No server-side processing required for Excel transformation
- Files are automatically downloaded after processing
- Supports .xlsx format only
