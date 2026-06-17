const ExcelJS = require('exceljs');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/ethereal_hijab';

async function main() {
  console.log('Generating DATA KEUANGAN ETHEREAL HIJAB.xlsx...');
  
  // Connect to DB to get live statistics
  let connection;
  let products = [];
  let ordersCount = 0;
  let totalRevenue = 0;
  try {
    connection = await mysql.createConnection(dbUrl);
    const [prods] = await connection.query('SELECT * FROM `Product`');
    products = prods;
    const [orders] = await connection.query('SELECT COUNT(*) as cnt, SUM(totalAmount) as rev FROM `Order`');
    ordersCount = orders[0].cnt || 0;
    totalRevenue = orders[0].rev || 0;
  } catch (err) {
    console.warn('Could not read from database. Using default fallback values.', err.message);
    // Fallbacks
    products = [
      { id: 1, name: 'Ethereal Voal Square Premium', price: 85000 },
      { id: 2, name: 'Silk Pashmina Shimmer', price: 110000 },
      { id: 3, name: 'Bergo Maryam Instant Daily', price: 45000 },
      { id: 4, name: 'Pashmina Inner 2-in-1 Ethereal', price: 75000 },
      { id: 5, name: 'Turban Instant Pleated', price: 55000 },
      { id: 6, name: 'Sport Hijab Active Air', price: 60000 },
      { id: 7, name: 'Ciput Rajut Anti Bingung', price: 20000 }
    ];
  } finally {
    if (connection) await connection.end();
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Meutia';
  workbook.lastModifiedBy = 'Meutia';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Style helper
  const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE6DCD2' } // Beige background
  };
  
  const headerFont = {
    name: 'Calibri',
    bold: true,
    color: { argb: 'FF4A3E3D' },
    size: 11
  };

  const titleFont = {
    name: 'Georgia',
    bold: true,
    color: { argb: 'FF6D544C' },
    size: 16
  };

  // 1. SHEET SUMMARY
  const sheetSummary = workbook.addWorksheet('Ringkasan Proyek');
  sheetSummary.views = [{ showGridLines: true }];
  
  sheetSummary.getCell('B2').value = 'STUDI KELAYAKAN BISNIS (SKB) - ETHEREAL HIJAB';
  sheetSummary.getCell('B2').font = titleFont;
  
  sheetSummary.getCell('B4').value = 'Pemilik Usaha:';
  sheetSummary.getCell('B4').font = { bold: true };
  sheetSummary.getCell('C4').value = 'Meutia';
  
  sheetSummary.getCell('B5').value = 'NPM:';
  sheetSummary.getCell('B5').font = { bold: true };
  sheetSummary.getCell('C5').value = '062140612888';
  
  sheetSummary.getCell('B6').value = 'Kelas:';
  sheetSummary.getCell('B6').font = { bold: true };
  sheetSummary.getCell('C6').value = '8 BPA';

  sheetSummary.getCell('B8').value = 'Daftar Produk & Harga Jual:';
  sheetSummary.getCell('B8').font = { bold: true, size: 12 };
  
  sheetSummary.getCell('B9').value = 'ID';
  sheetSummary.getCell('C9').value = 'Nama Produk';
  sheetSummary.getCell('D9').value = 'Harga Jual (IDR)';
  
  ['B9', 'C9', 'D9'].forEach(c => {
    sheetSummary.getCell(c).fill = headerFill;
    sheetSummary.getCell(c).font = headerFont;
  });

  products.forEach((p, idx) => {
    const row = 10 + idx;
    sheetSummary.getCell(`B${row}`).value = p.id;
    sheetSummary.getCell(`C${row}`).value = p.name;
    sheetSummary.getCell(`D${row}`).value = p.price;
    sheetSummary.getCell(`D${row}`).numFmt = '#,##0';
  });

  // 2. SHEET INVESTASI AWAL
  const sheetInv = workbook.addWorksheet('Investasi Awal');
  sheetInv.views = [{ showGridLines: true }];
  sheetInv.getCell('B2').value = 'BIAYA INVESTASI AWAL - ETHEREAL HIJAB';
  sheetInv.getCell('B2').font = titleFont;
  
  const invHeaders = ['No', 'Uraian Kebutuhan', 'Kuantitas', 'Harga Satuan (IDR)', 'Jumlah Biaya (IDR)'];
  invHeaders.forEach((h, idx) => {
    const col = String.fromCharCode(66 + idx); // B, C, D, E, F
    const cell = sheetInv.getCell(`${col}4`);
    cell.value = h;
    cell.fill = headerFill;
    cell.font = headerFont;
  });

  const invItems = [
    [1, 'Mesin Jahit Juki High Speed', 2, 4500000],
    [2, 'Mesin Obras Benang 4', 1, 3500000],
    [3, 'Gunting Kain Elektrik', 1, 800000],
    [4, 'Setrika Uap / Steamer', 1, 1200000],
    [5, 'Manekin Set Hanger', 5, 200000],
    [6, 'Sewa Workshop & Butik (1 Tahun)', 1, 20000000],
    [7, 'Renovasi Interior Butik', 1, 5000000],
    [8, 'Papan Nama Acrylic & LED', 1, 1500000],
    [9, 'Laptop Administrasi Kasir', 1, 4000000],
    [10, 'Biaya Legalitas & Izin Usaha', 1, 2000000],
    [11, 'Kas Awal / Modal Kerja Operasional', 1, 10000000],
  ];

  invItems.forEach((item, idx) => {
    const row = 5 + idx;
    sheetInv.getCell(`B${row}`).value = item[0];
    sheetInv.getCell(`C${row}`).value = item[1];
    sheetInv.getCell(`D${row}`).value = item[2];
    sheetInv.getCell(`E${row}`).value = item[3];
    sheetInv.getCell(`E${row}`).numFmt = '#,##0';
    sheetInv.getCell(`F${row}`).value = { formula: `D${row}*E${row}` };
    sheetInv.getCell(`F${row}`).numFmt = '#,##0';
  });

  const totalInvRow = 5 + invItems.length;
  sheetInv.getCell(`C${totalInvRow}`).value = 'TOTAL INVESTASI AWAL';
  sheetInv.getCell(`C${totalInvRow}`).font = { bold: true };
  sheetInv.getCell(`F${totalInvRow}`).value = { formula: `SUM(F5:F${totalInvRow-1})` };
  sheetInv.getCell(`F${totalInvRow}`).font = { bold: true };
  sheetInv.getCell(`F${totalInvRow}`).numFmt = '#,##0';

  // 3. SHEET HPP & BIAYA VARIABEL
  const sheetHpp = workbook.addWorksheet('HPP & Biaya Variabel');
  sheetHpp.views = [{ showGridLines: true }];
  sheetHpp.getCell('B2').value = 'BIAYA PRODUKSI & MARGIN HPP';
  sheetHpp.getCell('B2').font = titleFont;

  const hppHeaders = ['No', 'Nama Hijab', 'Bahan Baku (IDR)', 'Packaging & Label (IDR)', 'Tenaga Kerja Jahit (IDR)', 'Total HPP (IDR)', 'Harga Jual (IDR)', 'Margin Laba (IDR)'];
  hppHeaders.forEach((h, idx) => {
    const col = String.fromCharCode(66 + idx); // B to I
    const cell = sheetHpp.getCell(`${col}4`);
    cell.value = h;
    cell.fill = headerFill;
    cell.font = headerFont;
  });

  const hppItems = [
    [1, 'Ethereal Voal Square Premium', 22000, 4000, 9000, 85000],
    [2, 'Silk Pashmina Shimmer', 28000, 4000, 10000, 110000],
    [3, 'Bergo Maryam Instant Daily', 11000, 3000, 6000, 45000],
    [4, 'Pashmina Inner 2-in-1 Ethereal', 19000, 4000, 9000, 75000],
    [5, 'Turban Instant Pleated', 13000, 3000, 7000, 55000],
    [6, 'Sport Hijab Active Air', 15000, 3000, 7000, 60000],
    [7, 'Ciput Rajut Anti Bingung', 4000, 2000, 3000, 20000],
  ];

  hppItems.forEach((item, idx) => {
    const row = 5 + idx;
    sheetHpp.getCell(`B${row}`).value = item[0];
    sheetHpp.getCell(`C${row}`).value = item[1];
    sheetHpp.getCell(`D${row}`).value = item[2];
    sheetHpp.getCell(`D${row}`).numFmt = '#,##0';
    sheetHpp.getCell(`E${row}`).value = item[3];
    sheetHpp.getCell(`E${row}`).numFmt = '#,##0';
    sheetHpp.getCell(`F${row}`).value = item[4];
    sheetHpp.getCell(`F${row}`).numFmt = '#,##0';
    
    // Total HPP Formula: D + E + F
    sheetHpp.getCell(`G${row}`).value = { formula: `SUM(D${row}:F${row})` };
    sheetHpp.getCell(`G${row}`).numFmt = '#,##0';
    sheetHpp.getCell(`H${row}`).value = item[5]; // Harga Jual
    sheetHpp.getCell(`H${row}`).numFmt = '#,##0';
    
    // Margin Formula: Harga Jual - HPP
    sheetHpp.getCell(`I${row}`).value = { formula: `H${row}-G${row}` };
    sheetHpp.getCell(`I${row}`).numFmt = '#,##0';
  });

  // 4. SHEET ARUS KAS (12 BULAN)
  const sheetCash = workbook.addWorksheet('Arus Kas');
  sheetCash.views = [{ showGridLines: true }];
  sheetCash.getCell('B2').value = 'PROYEKSI ARUS KAS 12 BULAN (TAHUNAN) - ETHEREAL HIJAB';
  sheetCash.getCell('B2').font = titleFont;

  const cashHeaders = ['Uraian / Bulan', 'Bulan 1', 'Bulan 2', 'Bulan 3', 'Bulan 4', 'Bulan 5', 'Bulan 6', 'Bulan 7', 'Bulan 8', 'Bulan 9', 'Bulan 10', 'Bulan 11', 'Bulan 12'];
  cashHeaders.forEach((h, idx) => {
    const cell = sheetCash.getCell(4, 2 + idx);
    cell.value = h;
    cell.fill = headerFill;
    cell.font = headerFont;
  });

  // Uraian labels
  sheetCash.getCell('B5').value = 'Penerimaan Kas (Omset)';
  sheetCash.getCell('B6').value = 'Pengeluaran Kas:';
  sheetCash.getCell('B7').value = '  - HPP Bahan & Produksi';
  sheetCash.getCell('B8').value = '  - Operasional & Gaji';
  sheetCash.getCell('B9').value = '  - Pemasaran / Iklan';
  sheetCash.getCell('B10').value = 'Total Pengeluaran Kas';
  sheetCash.getCell('B10').font = { bold: true };
  sheetCash.getCell('B11').value = 'Surplus / Arus Kas Bersih';
  sheetCash.getCell('B11').font = { bold: true };

  // Assume baseline monthly revenue from real sales if any
  const baseRevenue = totalRevenue > 0 ? totalRevenue / 2 : 45000000; // default 45M per month baseline
  const growthRates = [0.0, 0.05, 0.07, 0.10, 0.12, 0.15, 0.17, 0.20, 0.22, 0.25, 0.27, 0.30];
  const expenseRatios = [0.45, 0.44, 0.43, 0.42, 0.42, 0.41, 0.41, 0.40, 0.40, 0.39, 0.39, 0.38]; // HPP
  const operExpenses = [12000000, 12200000, 12500000, 12800000, 13000000, 13200000, 13500000, 13800000, 14000000, 14200000, 14500000, 14800000];
  const marketing = [3000000, 3100000, 3200000, 3300000, 3400000, 3500000, 3600000, 3700000, 3800000, 3900000, 4000000, 4100000];

  for (let m = 0; m < 12; m++) {
    const colStr = String.fromCharCode(67 + m); // C to N
    
    // Revenue
    const monthlyRev = Math.round(baseRevenue * (1 + growthRates[m]));
    sheetCash.getCell(`${colStr}5`).value = monthlyRev;
    sheetCash.getCell(`${colStr}5`).numFmt = '#,##0';

    // HPP
    const monthlyHpp = Math.round(monthlyRev * expenseRatios[m]);
    sheetCash.getCell(`${colStr}7`).value = monthlyHpp;
    sheetCash.getCell(`${colStr}7`).numFmt = '#,##0';

    // Ops
    sheetCash.getCell(`${colStr}8`).value = operExpenses[m];
    sheetCash.getCell(`${colStr}8`).numFmt = '#,##0';

    // Marketing
    sheetCash.getCell(`${colStr}9`).value = marketing[m];
    sheetCash.getCell(`${colStr}9`).numFmt = '#,##0';

    // Total expenses
    sheetCash.getCell(`${colStr}10`).value = { formula: `SUM(${colStr}7:${colStr}9)` };
    sheetCash.getCell(`${colStr}10`).numFmt = '#,##0';
    sheetCash.getCell(`${colStr}10`).font = { bold: true };

    // Net cash flow
    sheetCash.getCell(`${colStr}11`).value = { formula: `${colStr}5-${colStr}10` };
    sheetCash.getCell(`${colStr}11`).numFmt = '#,##0';
    sheetCash.getCell(`${colStr}11`).font = { bold: true };
  }

  // 5. SHEET ANALISIS KELAYAKAN
  const sheetFeas = workbook.addWorksheet('Analisis Kelayakan');
  sheetFeas.views = [{ showGridLines: true }];
  sheetFeas.getCell('B2').value = 'ANALISIS KELAYAKAN INVESTASI - ETHEREAL HIJAB';
  sheetFeas.getCell('B2').font = titleFont;

  sheetFeas.getCell('B4').value = '1. Accounting Rate of Return (ARR)';
  sheetFeas.getCell('B4').font = { bold: true, size: 12 };
  
  sheetFeas.getCell('B5').value = 'Investasi Awal (Io)';
  sheetFeas.getCell('C5').value = { formula: "'Investasi Awal'!F16" };
  sheetFeas.getCell('C5').numFmt = '#,##0';

  sheetFeas.getCell('B6').value = 'Rata-rata Laba Bersih Per Bulan';
  sheetFeas.getCell('C6').value = { formula: "AVERAGE('Arus Kas'!C11:N11)" };
  sheetFeas.getCell('C6').numFmt = '#,##0';

  sheetFeas.getCell('B7').value = 'ARR (Tahunan)';
  sheetFeas.getCell('C7').value = { formula: "(C6*12)/C5" };
  sheetFeas.getCell('C7').numFmt = '0.0%';
  sheetFeas.getCell('C7').font = { bold: true };

  sheetFeas.getCell('B9').value = '2. Payback Period (PP)';
  sheetFeas.getCell('B9').font = { bold: true, size: 12 };
  
  sheetFeas.getCell('B10').value = 'Akumulasi Kas Masuk Bulan 1';
  sheetFeas.getCell('C10').value = { formula: "'Arus Kas'!C11" };
  sheetFeas.getCell('C10').numFmt = '#,##0';

  sheetFeas.getCell('B11').value = 'Akumulasi Kas Masuk Bulan 2';
  sheetFeas.getCell('C11').value = { formula: "'Arus Kas'!C11+'Arus Kas'!D11" };
  sheetFeas.getCell('C11').numFmt = '#,##0';

  sheetFeas.getCell('B12').value = 'Payback Period (Bulan)';
  sheetFeas.getCell('C12').value = { formula: 'C5/C6' }; // Estimated Payback Period in months
  sheetFeas.getCell('C12').numFmt = '0.0';
  sheetFeas.getCell('C12').font = { bold: true };

  sheetFeas.getCell('B14').value = '3. Net Present Value (NPV) & Profitability Index (PI)';
  sheetFeas.getCell('B14').font = { bold: true, size: 12 };
  
  sheetFeas.getCell('B15').value = 'Discount Rate (Suku Bunga)';
  sheetFeas.getCell('C15').value = 0.12; // 12% Discount Rate
  sheetFeas.getCell('C15').numFmt = '0%';

  sheetFeas.getCell('B16').value = 'Total PV of Cash Flows';
  sheetFeas.getCell('C16').value = { formula: "NPV(C15, 'Arus Kas'!C11:N11)" };
  sheetFeas.getCell('C16').numFmt = '#,##0';

  sheetFeas.getCell('B17').value = 'Net Present Value (NPV)';
  sheetFeas.getCell('C17').value = { formula: 'C16-C5' };
  sheetFeas.getCell('C17').numFmt = '#,##0';
  sheetFeas.getCell('C17').font = { bold: true };

  sheetFeas.getCell('B18').value = 'Profitability Index (PI)';
  sheetFeas.getCell('C18').value = { formula: 'C16/C5' };
  sheetFeas.getCell('C18').numFmt = '0.00';
  sheetFeas.getCell('C18').font = { bold: true };

  // Set widths
  [sheetSummary, sheetInv, sheetHpp, sheetCash, sheetFeas].forEach(sheet => {
    sheet.columns.forEach(col => {
      let maxLen = 0;
      col.eachCell({ includeEmpty: true }, cell => {
        if (cell.value) {
          const valStr = String(cell.value.formula || cell.value);
          if (valStr.length > maxLen) maxLen = valStr.length;
        }
      });
      col.width = Math.max(maxLen + 4, 12);
    });
  });

  // Save Excel file in root directory
  const savePath = 'd:/REPOSITORY/Etherealhijab/DATA KEUANGAN ETHEREAL HIJAB.xlsx';
  await workbook.xlsx.writeFile(savePath);
  console.log('Successfully saved to:', savePath);
}

main().catch(console.error);
