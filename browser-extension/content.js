function addButtons() {
  document.querySelectorAll('div[data-tooltip^="Download"]').forEach(btn => {
    if (!btn.dataset.uploaderAdded) {
      const uploadBtn = document.createElement('button');
      uploadBtn.textContent = 'Upload';
      uploadBtn.style.marginLeft = '4px';
      uploadBtn.onclick = async () => {
        const url = btn.parentElement.href;
        if (!url) return;
        const resp = await fetch(url);
        const blob = await resp.blob();
        const form = new FormData();
        form.append('invoiceFile', blob, 'invoice.pdf');
        chrome.runtime.sendMessage({ type: 'UPLOAD_INVOICE', formData: form });
      };
      btn.after(uploadBtn);
      btn.dataset.uploaderAdded = 'true';
    }
  });
}
setInterval(addButtons, 2000);
