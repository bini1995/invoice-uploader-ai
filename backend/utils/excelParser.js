const ExcelJS = require('exceljs');

exports.parseExcel = async (filePath) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];
  const headers = worksheet.getRow(1).values.slice(1).map(h => h && h.toString().trim());
  const rows = [];
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = row.getCell(idx + 1).text;
    });
    rows.push(obj);
  });
  return rows;
};
