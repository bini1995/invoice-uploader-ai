// Temporary stub of the signing endpoint without DocuSign or blockchain logic

export const createSigningRequest = async (req, res) => {
  const { id } = req.params;
  // In the simplified MVP we simply return a placeholder URL
  // without hashing the document or contacting DocuSign.
  const url = `https://example.com/sign/${id}`;
  res.json({ url });
};
