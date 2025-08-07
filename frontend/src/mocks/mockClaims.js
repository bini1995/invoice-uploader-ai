export function generateMockClaims(count = 10) {
  const providers = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams'];
  const cptCodes = ['99213', '99397', '90834', '93000'];
  const types = ['Professional', 'Facility'];
  const statuses = ['Pending', 'Approved', 'Denied'];

  return Array.from({ length: count }, (_, i) => ({
    claim_id: `CLM-${1000 + i}`,
    provider_name: providers[i % providers.length],
    cpt_summary: cptCodes[i % cptCodes.length],
    claim_type: types[i % types.length],
    status: statuses[i % statuses.length],
    total_amount: (100 + i * 10).toFixed(2),
    flagged_issues: i % 3 === 0 ? 1 : 0,
  }));
}

export const mockClaims = generateMockClaims();
