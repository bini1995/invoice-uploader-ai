// backend/app.js

const express = require('express');         // web server framework
const cors = require('cors');
require('dotenv').config();                 // load environment variables
const invoiceRoutes = require('./routes/invoiceRoutes'); // we'll make this next

const app = express();                      // create the app

console.log('🟡 Starting server...');

app.use(cors());
app.use(express.json());                    // allow reading JSON data
app.use('/api/invoices', invoiceRoutes);    // route all invoice requests here

console.log('🟢 Routes mounted');


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});