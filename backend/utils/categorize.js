const CATEGORY_KEYWORDS = {
  Software: ['software', 'saas', 'license', 'cloud', 'aws', 'zoom', 'notion', 'figma'],
  Travel: ['flight', 'hotel', 'airline', 'uber', 'lyft', 'airbnb', 'travel'],
  Office: ['office', 'supplies', 'stationery', 'printer', 'staples'],
};

function categorizeInvoice({ vendor = '', description = '' }) {
  const text = `${vendor} ${description}`.toLowerCase();
  for (const [cat, keys] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const k of keys) {
      if (text.includes(k.toLowerCase())) return cat;
    }
  }
  return 'Other';
}

module.exports = { categorizeInvoice };
