
import fs from 'fs';
import path from 'path';
import pool from '../config/db.js';
import { fileURLToPath } from 'url';
let model = { corrections: {}, categoryMap: {}, tagMap: {} };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadModel() {
  try {
    const file = path.join(__dirname, '..', 'data', 'ocr_model.json');
    if (fs.existsSync(file)) {
      model = JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (err) {
    console.error('Load model error:', err.message);
  }
}

async function trainFromCorrections() {
  try {
    const { rows } = await pool.query('SELECT field, old_value, new_value FROM ocr_corrections');
    model.corrections = {};
    for (const r of rows) {
      if (!r.old_value || !r.new_value) continue;
      if (!model.corrections[r.field]) model.corrections[r.field] = {};
      model.corrections[r.field][r.old_value.toLowerCase()] = r.new_value;
    }

    const { rows: catRows } = await pool.query(
      'SELECT vendor, category, tags FROM invoices WHERE category IS NOT NULL OR tags IS NOT NULL'
    );
    model.categoryMap = {};
    model.tagMap = {};
    for (const r of catRows) {
      const vendor = r.vendor?.toLowerCase();
      if (!vendor) continue;
      if (r.category) {
        model.categoryMap[vendor] = model.categoryMap[vendor] || {};
        model.categoryMap[vendor][r.category] = (model.categoryMap[vendor][r.category] || 0) + 1;
      }
      if (Array.isArray(r.tags)) {
        model.tagMap[vendor] = model.tagMap[vendor] || {};
        for (const t of r.tags) {
          model.tagMap[vendor][t] = (model.tagMap[vendor][t] || 0) + 1;
        }
      }
    }

    // Note: documents table doesn't have vendor column, so we'll skip this query for now
    // TODO: Update this query when vendor information is properly stored in documents table
    const { rows: fbRows } = await pool.query(
      `SELECT f.suggested_category FROM category_feedback f WHERE f.accepted = TRUE`
    );
    for (const r of fbRows) {
      if (!r.suggested_category) continue;
      // Store category suggestions without vendor association for now
      model.categoryMap['general'] = model.categoryMap['general'] || {};
      model.categoryMap['general'][r.suggested_category] = (model.categoryMap['general'][r.suggested_category] || 0) + 1;
    }

    const file = path.join(__dirname, '..', 'data', 'ocr_model.json');
    fs.writeFileSync(file, JSON.stringify(model, null, 2));
  } catch (err) {
    console.error('Agent training failed:', err.message);
  }
}

function applyModel(invoice) {
  if (!invoice) return invoice;
  const out = { ...invoice };
  for (const field of Object.keys(model.corrections)) {
    const v = out[field];
    if (typeof v === 'string') {
      const lower = v.toLowerCase();
      if (model.corrections[field][lower]) {
        out[field] = model.corrections[field][lower];
      }
    }
  }
  return out;
}

function getSuggestions(invoice) {
  const vendor = invoice.vendor?.toLowerCase();
  const suggestions = {};
  if (vendor && model.categoryMap[vendor]) {
    const cats = Object.entries(model.categoryMap[vendor]).sort((a, b) => b[1] - a[1]);
    if (cats.length) suggestions.category = cats[0][0];
  }
  if (vendor && model.tagMap[vendor]) {
    const tags = Object.entries(model.tagMap[vendor]).sort((a, b) => b[1] - a[1]).slice(0, 3).map(t => t[0]);
    if (tags.length) suggestions.tags = tags;
  }
  return suggestions;
}

export { loadModel, trainFromCorrections, applyModel, getSuggestions };
