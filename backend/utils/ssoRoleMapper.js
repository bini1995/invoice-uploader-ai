const SSO_ROLE_MAP = {
  'Okta:AdjusterGroup': 'adjuster',
  'Okta:MedicalReviewers': 'medical_reviewer',
  'Okta:Auditors': 'auditor',
};

function mapSsoGroupsToRole(groups = []) {
  for (const g of groups) {
    if (SSO_ROLE_MAP[g]) return SSO_ROLE_MAP[g];
  }
  return null; // deny by default
}

module.exports = { mapSsoGroupsToRole };
