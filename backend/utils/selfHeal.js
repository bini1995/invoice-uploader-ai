const openai = require('../config/openai');

async function selfHealInvoices(invoices) {
  if (!process.env.OPENROUTER_API_KEY) return invoices;
  const healed = [];
  for (const inv of invoices) {
    if (inv.invoice_number && inv.date && inv.amount && inv.vendor) {
      healed.push(inv);
      continue;
    }
    try {
      const prompt = `Fix this invoice JSON by filling missing invoice_number, date, amount or vendor if possible. Return JSON.\n\n${JSON.stringify(inv)}`;
      const resp = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You repair corrupted invoice data.' },
          { role: 'user', content: prompt },
        ],
      });
      const txt = resp.choices?.[0]?.message?.content?.trim();
      try {
        healed.push(JSON.parse(txt));
      } catch {
        healed.push(inv);
      }
    } catch (err) {
      console.error('Self heal error:', err.response?.data || err.message);
      healed.push(inv);
    }
  }
  return healed;
}

module.exports = { selfHealInvoices };
