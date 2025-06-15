chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'UPLOAD_INVOICE') {
    fetch('http://localhost:3000/api/invoices/upload', {
      method: 'POST',
      body: msg.formData
    })
      .then(() => sendResponse({ success: true }))
      .catch(() => sendResponse({ success: false }));
    return true;
  }
});
