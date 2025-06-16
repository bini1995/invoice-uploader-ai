const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const pool = require('../config/db');
const { parseCSV } = require('../utils/csvParser');
const { parsePDF } = require('../utils/pdfParser');
const { parseImage } = require('../utils/imageParser');
const { logActivity } = require('../utils/activityLogger');

const VENDORS = [
  { id: 1, name: 'Acme', password: 'acme123' },
  { id: 2, name: 'Globex', password: 'globex123' },
];

const BANK_INFO = {};

exports.login = (req, res) => {
  const { vendor, password } = req.body;
  const v = VENDORS.find((vv) => vv.name === vendor && vv.password === password);
  if (!v) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ vendor: v.name, id: v.id }, 'vendorSecret', { expiresIn: '1d' });
  res.json({ token });
};

exports.auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'vendorSecret');
    req.vendor = decoded.vendor;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.listInvoices = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM invoices WHERE vendor=$1 ORDER BY date DESC', [req.vendor]);
    res.json({ invoices: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
};

exports.updateBankInfo = async (req, res) => {
  BANK_INFO[req.vendor] = req.body.bank || '';
  try {
    await logActivity(null, 'change_bank_info', null, req.vendor);
  } catch (err) {
    console.error('Bank info log error:', err);
  }
  res.json({ message: 'Bank info updated' });
};

exports.getBankInfo = (req, res) => {
  res.json({ bank: BANK_INFO[req.vendor] || '' });
};

exports.uploadInvoice = [upload.single('invoiceFile'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const ext = require('path').extname(req.file.originalname).toLowerCase();
  let invoices;
  if (ext === '.csv') invoices = await parseCSV(req.file.path);
  else if (ext === '.pdf') invoices = await parsePDF(req.file.path);
  else if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') invoices = await parseImage(req.file.path);
  else return res.status(400).json({ message: 'Unsupported file type' });

  try {
    for (const inv of invoices) {
      await pool.query(
        'INSERT INTO invoices (invoice_number,date,amount,vendor) VALUES ($1,$2,$3,$4)',
        [inv.invoice_number, inv.date, inv.amount, req.vendor]
      );
    }
    res.json({ inserted: invoices.length });
  } catch (err) {
    console.error('Vendor upload error:', err);
    res.status(500).json({ message: 'Failed to save invoice' });
  }
}];

exports.paymentStatus = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT invoice_number,payment_status FROM invoices WHERE vendor=$1', [req.vendor]);
    res.json({ payments: rows });
  } catch {
    res.status(500).json({ message: 'Failed to fetch status' });
  }
};
