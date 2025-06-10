// backend/app.js

const express = require('express');         // web server framework
const cors = require('cors');
require('dotenv').config();                 // load environment variables
const invoiceRoutes = require('./routes/invoiceRoutes'); // we'll make this next
const feedbackRoutes = require('./routes/feedbackRoutes');
const { autoArchiveOldInvoices, autoDeleteExpiredInvoices } = require('./controllers/invoiceController');

const app = express();                      // create the app

console.log('🟡 Starting server...');

app.use(cors());
app.use(express.json());                    // allow reading JSON data
app.use('/api/invoices', invoiceRoutes);    // route all invoice requests here
app.use('/api/feedback', feedbackRoutes);

// Run auto-archive daily
autoArchiveOldInvoices();
setInterval(autoArchiveOldInvoices, 24 * 60 * 60 * 1000); // every 24h
autoDeleteExpiredInvoices();
setInterval(autoDeleteExpiredInvoices, 24 * 60 * 60 * 1000);

console.log('🟢 Routes mounted');

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
