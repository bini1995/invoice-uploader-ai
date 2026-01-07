// ML-based detection disabled for now

function detectAnomalies(rows) {
  // ML scoring disabled; return neutral scores
  return rows.map((r) => ({ id: r.id, score: 0.5 }));
}

export { detectAnomalies };
