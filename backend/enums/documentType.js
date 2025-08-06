const DocumentType = Object.freeze({
  INVOICE: 'invoice',
  RECEIPT: 'receipt',
  CONTRACT: 'contract',
  FORM: 'form',
  CLAIM: 'claim',
  CLAIM_INVOICE: 'claim_invoice',
  MEDICAL_BILL: 'medical_bill',
  FNOL_FORM: 'fnol_form',
  OTHER: 'other'
});

module.exports = { DocumentType };
