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
