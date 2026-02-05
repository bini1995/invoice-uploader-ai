import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_BASE = process.env.API_BASE || 'http://localhost:3000';
const TEST_USER = process.env.TEST_USER || 'admin';
const TEST_PASS = process.env.TEST_PASS || 'admin123';
const NUM_CLAIMS = parseInt(process.env.NUM_CLAIMS || '100', 10);
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '5', 10);

const CPT_CODES = [
  '99213', '99214', '99215', '99203', '99204',
  '99281', '99282', '99283', '99284', '99285',
  '97110', '97140', '97530', '97112', '97116',
  '99232', '99233', '99291', '99221', '99222',
  '27447', '29881', '23472', '27130', '63030'
];

const ICD10_CODES = [
  'M54.5', 'M54.2', 'M79.3', 'S39.012A', 'S82.001A',
  'M17.11', 'M75.110', 'G89.29', 'S72.001A', 'S42.001A',
  'E11.65', 'I10', 'J06.9', 'K21.0', 'M25.511',
  'S83.511A', 'M47.816', 'S62.001A', 'M79.604', 'Z96.641'
];

const FIRST_NAMES = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const PROVIDERS = ['NYC Orthopedic Associates', 'Manhattan Physical Therapy', 'Brooklyn Medical Center', 'Queens Health Services', 'Bronx Urgent Care', 'Long Island Spine Clinic', 'Westchester Radiology', 'Metro Pain Management', 'Hudson Valley PT', 'Empire State Medical Group'];
const CARRIERS = ['Liberty Mutual', 'State Farm', 'Progressive', 'Allstate', 'GEICO', 'Travelers', 'Hartford', 'Zurich', 'CNA Financial', 'Berkshire Hathaway'];

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomBetween(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomDate(start, end) {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().split('T')[0];
}

function generateClaimText(index) {
  const claimId = `CLM-${String(index + 1).padStart(5, '0')}`;
  const firstName = randomFrom(FIRST_NAMES);
  const lastName = randomFrom(LAST_NAMES);
  const claimantName = `${firstName} ${lastName}`;
  const policyNumber = `POL-${randomBetween(100000, 999999)}`;
  const dateOfIncident = randomDate(new Date('2024-06-01'), new Date('2025-12-31'));
  const numCpt = randomBetween(1, 3);
  const cptCodes = [];
  for (let i = 0; i < numCpt; i++) {
    const code = randomFrom(CPT_CODES);
    if (!cptCodes.includes(code)) cptCodes.push(code);
  }
  const numIcd = randomBetween(1, 3);
  const icdCodes = [];
  for (let i = 0; i < numIcd; i++) {
    const code = randomFrom(ICD10_CODES);
    if (!icdCodes.includes(code)) icdCodes.push(code);
  }
  const totalAmount = (randomBetween(500, 50000) + Math.random()).toFixed(2);
  const provider = randomFrom(PROVIDERS);
  const carrier = randomFrom(CARRIERS);
  const dob = randomDate(new Date('1950-01-01'), new Date('2000-12-31'));
  const memberId = `MEM-${randomBetween(100000, 999999)}`;

  const claimTypes = ['medical_bill', 'claim_invoice', 'fnol_form'];
  const claimType = randomFrom(claimTypes);

  let text = '';
  if (claimType === 'medical_bill') {
    text = `MEDICAL BILL / CLAIM STATEMENT
=========================================
Provider: ${provider}
Date of Service: ${dateOfIncident}

Patient Information:
  Name: ${claimantName}
  Date of Birth: ${dob}
  Member ID: ${memberId}
  Insurance Carrier: ${carrier}
  Policy Number: ${policyNumber}

Claim Reference: ${claimId}

Services Rendered:
${cptCodes.map(code => `  CPT Code: ${code}  -  $${(randomBetween(100, 5000)).toFixed(2)}`).join('\n')}

Diagnosis Codes:
${icdCodes.map(code => `  ICD-10: ${code}`).join('\n')}

Total Amount Billed: $${totalAmount}
Amount Paid: $0.00
Balance Due: $${totalAmount}

Provider Signature: ____________________
Date: ${dateOfIncident}
NPI: ${randomBetween(1000000000, 9999999999)}`;
  } else if (claimType === 'claim_invoice') {
    text = `INSURANCE CLAIM INVOICE
=========================================
Claim Number: ${claimId}
Policy Number: ${policyNumber}
Insurance Carrier: ${carrier}

Insured Party:
  Name: ${claimantName}
  Date of Birth: ${dob}
  Member ID: ${memberId}

Date of Loss/Incident: ${dateOfIncident}

Description of Claim:
  Patient ${claimantName} presented with injuries sustained on ${dateOfIncident}.
  Treatment provided at ${provider}.
  
  Procedure codes applied:
  ${cptCodes.map(code => `- ${code}`).join('\n  ')}
  
  Diagnostic codes:
  ${icdCodes.map(code => `- ${code}`).join('\n  ')}

Total Claimed Amount: $${totalAmount}
Deductible Applied: $${randomBetween(250, 2500).toFixed(2)}
Co-Pay: $${randomBetween(20, 100).toFixed(2)}

Status: Pending Review
Submitted By: ${provider}
Submission Date: ${randomDate(new Date('2025-01-01'), new Date('2025-12-31'))}`;
  } else {
    text = `FIRST NOTICE OF LOSS (FNOL)
=========================================
Report Number: ${claimId}
Date Filed: ${randomDate(new Date('2025-01-01'), new Date('2025-12-31'))}

Policy Information:
  Policy Number: ${policyNumber}
  Carrier: ${carrier}
  Insured: ${claimantName}

Incident Details:
  Date of Incident: ${dateOfIncident}
  Location: ${randomFrom(['123 Main St, New York, NY', '456 Broadway, Brooklyn, NY', '789 5th Ave, Manhattan, NY', '101 Queens Blvd, Queens, NY'])}
  
  Description: ${claimantName} sustained injuries requiring medical treatment.
  ${provider} provided treatment.

Medical Information:
  CPT Codes: ${cptCodes.join(', ')}
  ICD-10 Codes: ${icdCodes.join(', ')}
  Estimated Total: $${totalAmount}

Contact Information:
  Phone: (${randomBetween(200, 999)}) ${randomBetween(200, 999)}-${randomBetween(1000, 9999)}
  Email: ${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com

Adjuster Assigned: ${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`;
  }

  return {
    text,
    expected: {
      claim_id: claimId,
      claimant_name: claimantName,
      policy_number: policyNumber,
      date_of_incident: dateOfIncident,
      cpt_codes: cptCodes,
      icd10_codes: icdCodes,
      total_claimed_amount: totalAmount
    },
    claimType,
    fileName: `test_claim_${index + 1}.txt`
  };
}

async function login() {
  console.log(`Logging in as ${TEST_USER}...`);
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: TEST_USER, password: TEST_PASS })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  return data.token || data.accessToken;
}

async function uploadClaim(token, claim, index) {
  const tmpDir = path.join(__dirname, '..', 'tmp_test_claims');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const filePath = path.join(tmpDir, claim.fileName);
  fs.writeFileSync(filePath, claim.text);

  const formData = new FormData();
  const blob = new Blob([claim.text], { type: 'text/plain' });
  formData.append('file', blob, claim.fileName);

  const res = await fetch(`${API_BASE}/api/claims/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });

  fs.unlinkSync(filePath);

  if (!res.ok) {
    const text = await res.text();
    return { success: false, error: `Upload failed (${res.status}): ${text}`, index };
  }

  const data = await res.json();
  return { success: true, documentId: data.id, docType: data.doc_type, index };
}

async function extractClaimFields(token, documentId) {
  const res = await fetch(`${API_BASE}/api/claims/${documentId}/extract-fields`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!res.ok) {
    return { success: false, error: `Extraction failed (${res.status})` };
  }

  const data = await res.json();
  return { success: true, fields: data.fields || data };
}

function compareFields(expected, extracted) {
  const results = {
    total: 0,
    correct: 0,
    incorrect: 0,
    missing: 0,
    details: []
  };

  const fieldChecks = [
    { name: 'claim_id', type: 'exact' },
    { name: 'claimant_name', type: 'fuzzy' },
    { name: 'policy_number', type: 'exact' },
    { name: 'date_of_incident', type: 'date' },
    { name: 'cpt_codes', type: 'array' },
    { name: 'icd10_codes', type: 'array' },
    { name: 'total_claimed_amount', type: 'amount' }
  ];

  for (const check of fieldChecks) {
    results.total++;
    const expectedVal = expected[check.name];
    const extractedVal = extracted?.[check.name];

    if (extractedVal === undefined || extractedVal === null || extractedVal === '') {
      results.missing++;
      results.details.push({ field: check.name, status: 'missing', expected: expectedVal, extracted: extractedVal });
      continue;
    }

    let match = false;
    if (check.type === 'exact') {
      match = String(expectedVal).toLowerCase() === String(extractedVal).toLowerCase();
    } else if (check.type === 'fuzzy') {
      const exp = String(expectedVal).toLowerCase().replace(/\s+/g, '');
      const ext = String(extractedVal).toLowerCase().replace(/\s+/g, '');
      match = exp === ext || ext.includes(exp) || exp.includes(ext);
    } else if (check.type === 'date') {
      const expDate = new Date(expectedVal).toISOString().split('T')[0];
      const extDate = new Date(extractedVal).toISOString().split('T')[0];
      match = expDate === extDate;
    } else if (check.type === 'array') {
      const expArr = Array.isArray(expectedVal) ? expectedVal : [expectedVal];
      const extArr = Array.isArray(extractedVal) ? extractedVal : String(extractedVal).split(/[,\s]+/).filter(Boolean);
      const expSet = new Set(expArr.map(v => String(v).trim()));
      const extSet = new Set(extArr.map(v => String(v).trim()));
      const intersection = [...expSet].filter(v => extSet.has(v));
      match = intersection.length === expSet.size;
    } else if (check.type === 'amount') {
      const expAmt = parseFloat(String(expectedVal).replace(/[^0-9.]/g, ''));
      const extAmt = parseFloat(String(extractedVal).replace(/[^0-9.]/g, ''));
      match = Math.abs(expAmt - extAmt) < 0.01;
    }

    if (match) {
      results.correct++;
      results.details.push({ field: check.name, status: 'correct', expected: expectedVal, extracted: extractedVal });
    } else {
      results.incorrect++;
      results.details.push({ field: check.name, status: 'incorrect', expected: expectedVal, extracted: extractedVal });
    }
  }

  return results;
}

async function processInBatches(items, batchSize, processor) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
    if (i + batchSize < items.length) {
      process.stdout.write(`  Progress: ${Math.min(i + batchSize, items.length)}/${items.length}\r`);
    }
  }
  return results;
}

async function main() {
  console.log('='.repeat(60));
  console.log('ClarifyOps Internal Claims Pipeline Test');
  console.log('='.repeat(60));
  console.log(`Testing with ${NUM_CLAIMS} dummy claims (concurrency: ${CONCURRENCY})`);
  console.log(`API: ${API_BASE}`);
  console.log('');

  let token;
  try {
    token = await login();
    console.log('Login successful');
  } catch (err) {
    console.error('Login failed:', err.message);
    console.log('\nTo run this test, ensure a test user exists.');
    console.log('Usage: TEST_USER=admin TEST_PASS=admin123 node scripts/test-claims-pipeline.js');
    process.exit(1);
  }

  console.log('\n--- Phase 1: Generating dummy claims ---');
  const claims = [];
  for (let i = 0; i < NUM_CLAIMS; i++) {
    claims.push(generateClaimText(i));
  }
  const typeBreakdown = {};
  claims.forEach(c => { typeBreakdown[c.claimType] = (typeBreakdown[c.claimType] || 0) + 1; });
  console.log('Claim type distribution:', typeBreakdown);

  console.log('\n--- Phase 2: Uploading claims ---');
  const startUpload = Date.now();
  const uploadResults = await processInBatches(
    claims.map((claim, index) => ({ claim, index })),
    CONCURRENCY,
    ({ claim, index }) => uploadClaim(token, claim, index)
  );
  const uploadTime = ((Date.now() - startUpload) / 1000).toFixed(1);
  console.log(`\nUploads completed in ${uploadTime}s`);

  const successfulUploads = uploadResults.filter(r => r.success);
  const failedUploads = uploadResults.filter(r => !r.success);
  console.log(`  Successful: ${successfulUploads.length}/${NUM_CLAIMS}`);
  if (failedUploads.length > 0) {
    console.log(`  Failed: ${failedUploads.length}`);
    failedUploads.slice(0, 5).forEach(f => console.log(`    Claim ${f.index + 1}: ${f.error}`));
  }

  console.log('\n--- Phase 3: AI Field Extraction ---');
  const startExtract = Date.now();
  const extractionResults = await processInBatches(
    successfulUploads,
    Math.min(CONCURRENCY, 3),
    async (upload) => {
      const result = await extractClaimFields(token, upload.documentId);
      return { ...result, index: upload.index, documentId: upload.documentId };
    }
  );
  const extractTime = ((Date.now() - startExtract) / 1000).toFixed(1);
  console.log(`\nExtractions completed in ${extractTime}s`);

  const successfulExtractions = extractionResults.filter(r => r.success);
  const failedExtractions = extractionResults.filter(r => !r.success);
  console.log(`  Successful: ${successfulExtractions.length}/${successfulUploads.length}`);

  console.log('\n--- Phase 4: Accuracy Analysis ---');
  let totalFields = 0;
  let correctFields = 0;
  let incorrectFields = 0;
  let missingFields = 0;
  const fieldAccuracy = {};
  const errors = [];

  for (const extraction of successfulExtractions) {
    const expected = claims[extraction.index].expected;
    const comparison = compareFields(expected, extraction.fields);
    totalFields += comparison.total;
    correctFields += comparison.correct;
    incorrectFields += comparison.incorrect;
    missingFields += comparison.missing;

    for (const detail of comparison.details) {
      if (!fieldAccuracy[detail.field]) {
        fieldAccuracy[detail.field] = { total: 0, correct: 0, incorrect: 0, missing: 0 };
      }
      fieldAccuracy[detail.field].total++;
      fieldAccuracy[detail.field][detail.status]++;

      if (detail.status !== 'correct') {
        errors.push({
          claim: extraction.index + 1,
          field: detail.field,
          expected: detail.expected,
          extracted: detail.extracted,
          status: detail.status
        });
      }
    }
  }

  const overallAccuracy = totalFields > 0 ? ((correctFields / totalFields) * 100).toFixed(2) : 0;
  const avgProcessingTime = successfulExtractions.length > 0
    ? (parseFloat(extractTime) / successfulExtractions.length * 60).toFixed(1)
    : 0;

  console.log('\n' + '='.repeat(60));
  console.log('RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`\nTotal claims tested: ${NUM_CLAIMS}`);
  console.log(`Upload success rate: ${((successfulUploads.length / NUM_CLAIMS) * 100).toFixed(1)}%`);
  console.log(`Extraction success rate: ${((successfulExtractions.length / successfulUploads.length) * 100).toFixed(1)}%`);
  console.log(`\nOverall field accuracy: ${overallAccuracy}%`);
  console.log(`  Correct: ${correctFields}/${totalFields}`);
  console.log(`  Incorrect: ${incorrectFields}/${totalFields}`);
  console.log(`  Missing: ${missingFields}/${totalFields}`);
  console.log(`\nAvg extraction time per claim: ~${avgProcessingTime}s`);
  console.log(`Total pipeline time: ${((Date.now() - startUpload) / 1000 / 60).toFixed(1)} minutes`);

  console.log('\n--- Per-Field Accuracy ---');
  for (const [field, stats] of Object.entries(fieldAccuracy)) {
    const accuracy = ((stats.correct / stats.total) * 100).toFixed(1);
    console.log(`  ${field.padEnd(25)} ${accuracy}% (${stats.correct}/${stats.total} correct, ${stats.missing} missing)`);
  }

  if (errors.length > 0) {
    console.log(`\n--- Sample Errors (first 10) ---`);
    errors.slice(0, 10).forEach(err => {
      console.log(`  Claim #${err.claim} | ${err.field} | Expected: ${JSON.stringify(err.expected)} | Got: ${JSON.stringify(err.extracted)} | ${err.status}`);
    });
  }

  console.log('\n--- Performance Benchmarks ---');
  console.log(`  Target: 99.9% accuracy, 18-min avg processing`);
  console.log(`  Actual: ${overallAccuracy}% accuracy, ${avgProcessingTime}s avg per claim`);
  
  if (parseFloat(overallAccuracy) >= 99.9) {
    console.log(`  PASS: Accuracy target met`);
  } else if (parseFloat(overallAccuracy) >= 95) {
    console.log(`  CLOSE: Accuracy near target (${overallAccuracy}% vs 99.9%)`);
  } else {
    console.log(`  NEEDS WORK: Accuracy below target (${overallAccuracy}% vs 99.9%)`);
  }

  const reportPath = path.join(__dirname, '..', 'test-results.json');
  const report = {
    timestamp: new Date().toISOString(),
    config: { numClaims: NUM_CLAIMS, concurrency: CONCURRENCY },
    results: {
      uploadSuccessRate: ((successfulUploads.length / NUM_CLAIMS) * 100).toFixed(1),
      extractionSuccessRate: ((successfulExtractions.length / Math.max(successfulUploads.length, 1)) * 100).toFixed(1),
      overallAccuracy,
      totalFields,
      correctFields,
      incorrectFields,
      missingFields,
      avgExtractionTimeSec: avgProcessingTime,
      totalPipelineTimeMin: ((Date.now() - startUpload) / 1000 / 60).toFixed(1)
    },
    fieldAccuracy,
    sampleErrors: errors.slice(0, 20),
    claimTypeDistribution: typeBreakdown
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nFull report saved to: ${reportPath}`);
  console.log('='.repeat(60));

  const tmpDir = path.join(__dirname, '..', 'tmp_test_claims');
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main().catch(err => {
  console.error('Test pipeline failed:', err);
  process.exit(1);
});
