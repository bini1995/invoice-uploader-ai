import React, { useState, useEffect } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/invoices')
      .then((res) => res.json())
      .then((data) => setInvoices(data))
      .catch((err) => {
        console.error('Fetch error:', err);
        setMessage('❌ Could not load invoices');
      });
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert('Please select a file');

    const formData = new FormData();
    formData.append('invoiceFile', file);

    try {
      const res = await fetch('http://localhost:3000/api/invoices/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      setMessage(`✅ ${data.inserted} invoice(s) uploaded`);
      if (data.errors?.length) {
        setMessage((prev) => prev + `\n❌ ${data.errors.length} row(s) had issues`);
        setErrors(data.errors);
      } else {
        setErrors([]);
      }

      const updated = await fetch('http://localhost:3000/api/invoices');
      const updatedData = await updated.json();
      setInvoices(updatedData);
    } catch (err) {
      console.error('Upload failed:', err);
      setMessage('❌ Upload failed — something went wrong');
      setErrors([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-4 text-gray-800">Invoice Uploader</h1>

        <div className="flex items-center space-x-4 mb-6">
          <input
            type="file"
            onChange={handleFileChange}
            className="border rounded px-3 py-2"
          />
          <button
            onClick={handleUpload}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Upload CSV
          </button>
        </div>

        {message && (
          <div className="whitespace-pre-wrap mb-4 text-gray-700">
            {message}
          </div>
        )}

        {errors.length > 0 && (
          <div className="mb-4">
            <h3 className="text-red-600 font-semibold">Validation Errors:</h3>
            <ul className="list-disc list-inside text-sm text-red-500">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <h2 className="text-lg font-medium mt-8 mb-2 text-gray-800">Uploaded Invoices</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 text-sm">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Invoice #</th>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Amount</th>
                <th className="border px-4 py-2">Vendor</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="text-center">
                  <td className="border px-4 py-2">{inv.id}</td>
                  <td className="border px-4 py-2">{inv.invoice_number}</td>
                  <td className="border px-4 py-2">
                    {inv.date ? new Date(inv.date).toLocaleDateString() : ''}
                  </td>
                  <td className="border px-4 py-2">
                    {inv.amount ? `$${parseFloat(inv.amount).toFixed(2)}` : ''}
                  </td>
                  <td className="border px-4 py-2">{inv.vendor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
