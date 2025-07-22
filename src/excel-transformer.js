const XLSX = require('xlsx');
const path = require('path');

/**
 * Reads an XLSX file, transforms the data, and writes a new XLSX file with specific columns.
 * @param {string} filePath - Path to the XLSX file.
 * @param {string} medicoLectura - Name of the doctor who reads (default 'TBD').
 */
function transformXlsx(filePath, medicoLectura = 'TBD') {
  // Read the workbook
  const workbook = XLSX.readFile(filePath);
  // Get the first sheet name
  const sheetName = workbook.SheetNames[0];
  // Get the worksheet
  const worksheet = workbook.Sheets[sheetName];

  // Convert the worksheet to JSON, specifying the header row (row 2)
  const data = XLSX.utils.sheet_to_json(worksheet, {
    header: 1, // Get raw rows as arrays
    defval: '', // Default value for empty cells
  });

  // Row 2 (index 1) contains the column names
  const columnNames = data[1];
  // Data starts from row 3 (index 2)
  const rows = data.slice(2);

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
  const allRows = [outputColumns, ...transformedRows.map(row => outputColumns.map(col => String(row[col] ?? '')))]
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

  // Write the new workbook to the downloads folder with '-r' before the extension
  const parsedPath = path.parse(filePath);
  const outputFileName = `${parsedPath.name}-r${parsedPath.ext}`;
  const outputPath = path.join(parsedPath.dir, outputFileName);
  XLSX.writeFile(newWorkbook, outputPath);
  console.log(`✅ Transformed file written to: ${outputPath}`);
}

// Example usage:
const filePath = path.join(__dirname, '../downloads/ddavila-leidos-2025-07-22.xlsx');
const medicoLectura = process.argv[2] || 'TBD';
transformXlsx(filePath, medicoLectura);