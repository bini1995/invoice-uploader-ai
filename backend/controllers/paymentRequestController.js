const pool = require('../config/db');

// Return invoice info for a payment request form
exports.paymentRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT vendor, amount, due_date, invoice_number, date, description, payment_terms, tags
       FROM invoices WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    const invoice = result.rows[0];
    res.json({
      vendor: invoice.vendor,
      amount: invoice.amount,
      due_date: invoice.due_date,
      invoice_number: invoice.invoice_number,
      date: invoice.date,
      description: invoice.description,
      payment_terms: invoice.payment_terms,
      tags: invoice.tags,
    });
  } catch (err) {
    console.error('Payment request error:', err);
    res.status(500).json({ message: 'Failed to fetch payment request info' });
  }
};

// Generate a simple PDF payment request
exports.paymentRequestPDF = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT vendor, amount, due_date, invoice_number FROM invoices WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    const inv = result.rows[0];
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payment-request-${id}.pdf`);
    doc.pipe(res);
    doc.fontSize(16).text('Payment Request', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Vendor: ${inv.vendor}`);
    doc.text(`Invoice #: ${inv.invoice_number}`);
    doc.text(`Amount Due: $${inv.amount}`);
    if (inv.due_date) doc.text(`Due Date: ${inv.due_date}`);
    doc.end();
  } catch (err) {
    console.error('Payment request PDF error:', err);
    res.status(500).json({ message: 'Failed to generate payment request PDF' });
  }
};
