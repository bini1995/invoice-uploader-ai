import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_BASE = process.env.API_BASE || 'http://localhost:3000';
const TEST_USER = process.env.TEST_USER || 'admin';
const TEST_PASS = process.env.TEST_PASS || 'password123';

async function login() {
  console.log(`\n🔑 Logging in as ${TEST_USER}...`);
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

async function uploadClaim(token, fileName, content, mimeType) {
  const formData = new FormData();
  const blob = new Blob([content], { type: mimeType });
  formData.append('file', blob, fileName);

  const res = await fetch(`${API_BASE}/api/claims/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });

  if (!res.ok) {
    const text = await res.text();
    return { success: false, error: `Upload failed (${res.status}): ${text}` };
  }

  const data = await res.json();
  return { success: true, id: data.id, docType: data.doc_type, assignee: data.assignee };
}

async function extractFields(token, docId) {
  const res = await fetch(`${API_BASE}/api/claims/${docId}/extract-fields`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    return { success: false, error: `Extract failed (${res.status})` };
  }
  const data = await res.json();
  return { success: true, fields: data.fields || data };
}

const ts = Date.now();

const claims = [
  {
    name: `r2_bronx_er_visit_${ts}.txt`,
    category: 'emergency',
    content: `BRONX GENERAL HOSPITAL - EMERGENCY DEPARTMENT
Date of Service: 01/28/2026
Patient: Marcus Johnson  DOB: 03/15/1988
Member ID: BGH-2026-44891  Policy: POL-NY-8827341
Insurance: Empire BlueCross BlueShield
Diagnosis: Acute appendicitis with peritonitis
ICD-10: K35.20, K65.0
Procedure: Emergency appendectomy, laparoscopic
CPT: 44970, 99285, 76700
Attending: Dr. Sarah Chen, MD - Emergency Medicine
Anesthesia: General, 2.5 hours
Facility Fee: $28,750.00
Professional Fee: $6,200.00
Anesthesia Fee: $3,800.00
Lab/Imaging: $2,150.00
Pharmacy: $890.00
Total Charges: $41,790.00
Authorization #: AUTH-ER-2026-7741
Admission Date: 01/28/2026  Discharge: 01/30/2026`,
    mime: 'text/plain'
  },
  {
    name: `r2_miami_plastic_surgery_${ts}.txt`,
    category: 'medical_bill',
    content: `MIAMI COSMETIC & RECONSTRUCTIVE SURGERY CENTER
Invoice #: MCRS-2026-0219
Date: 02/01/2026
Patient: Elena Rodriguez  DOB: 07/22/1975
Member ID: UHC-FL-5567823  Policy: GRP-FL-90021
Insurance: UnitedHealthcare
Referring Physician: Dr. James Walker, Dermatology
Procedure: Reconstruction of nasal septum with turbinate reduction
CPT: 30520, 30140
Diagnosis: Deviated nasal septum with chronic sinusitis
ICD-10: J34.2, J32.9
Surgeon: Dr. Ricardo Alvarez, MD FACS
Facility Fee: $12,400.00
Surgeon Fee: $8,900.00
Anesthesia: $2,600.00
Pre-op Testing: $450.00
Total: $24,350.00
Prior Auth: PA-UHC-2026-11234
Medical Necessity: Documented chronic obstruction, failed conservative treatment x 6 months`,
    mime: 'text/plain'
  },
  {
    name: `r2_dallas_workers_comp_${ts}.txt`,
    category: 'workers_comp',
    content: `TEXAS WORKERS' COMPENSATION CLAIM FORM
TWC Claim #: WC-TX-2026-003847
Employer: Lone Star Construction LLC
Employee: Robert Williams  SSN: XXX-XX-4521
DOB: 11/03/1992  Hire Date: 06/15/2020
Date of Injury: 01/22/2026  Time: 14:30
Location: 4500 Commerce St, Dallas TX 75201
Nature of Injury: Fall from scaffolding - approximately 12 feet
Body Parts: Left shoulder, left wrist, lumbar spine
ICD-10: S42.012A, S62.102A, S33.5XXA
Witness: Michael Torres, Foreman
Supervisor Notified: 01/22/2026 at 14:45
First Treatment: Parkland Memorial Hospital ER
Treating Physician: Dr. Amanda Foster, Orthopedics
Initial Diagnosis: Displaced fracture left proximal humerus, distal radius fracture, lumbar sprain
Surgery Recommended: ORIF left shoulder
Estimated Lost Time: 8-12 weeks
Carrier: Texas Mutual Insurance  Policy: TMI-CC-887234
TTI Rate: $892.00/week  Max Medical: $185,606`,
    mime: 'text/plain'
  },
  {
    name: `r2_chicago_dental_claim_${ts}.txt`,
    category: 'dental',
    content: `LAKESHORE DENTAL ASSOCIATES
123 N Michigan Ave, Suite 400, Chicago IL 60601
ADA Dental Claim Form
Date: 01/30/2026
Patient: David Park  DOB: 09/14/2001
Subscriber: Jennifer Park  ID: DELTA-IL-29938741
Group #: GRP-CORP-4420
Insurance: Delta Dental of Illinois
Treating Dentist: Dr. Lisa Nguyen, DDS  NPI: 1234567890
Procedures Performed:
  D2740 - Crown, porcelain/ceramic substrate - Tooth #14 - $1,350.00
  D2950 - Core buildup including pins - Tooth #14 - $325.00
  D0274 - Bitewing radiographs, four images - $85.00
  D0120 - Periodic oral evaluation - $65.00
  D1110 - Prophylaxis, adult - $135.00
Diagnosis: K02.62 Dental caries on smooth surface penetrating into dentin
Total Charges: $1,960.00
Patient Copay Collected: $390.00
Amount Due from Insurance: $1,570.00
Next Appointment: 02/15/2026 - Crown seating`,
    mime: 'text/plain'
  },
  {
    name: `r2_boston_behavioral_health_${ts}.txt`,
    category: 'behavioral_health',
    content: `MASSACHUSETTS BEHAVIORAL HEALTH PARTNERS
Outpatient Mental Health Services
Claim Date: 01/25/2026
Client: Anonymous Patient (Confidential)
Member ID: BCBS-MA-77123456  Group: GRP-STATE-1100
Insurance: Blue Cross Blue Shield of Massachusetts
Provider: Dr. Rachel Morrison, PhD, Licensed Psychologist
NPI: 9876543210  License: PSY-MA-12345
Service Location: 200 Beacon St, Suite 300, Boston MA 02116
Sessions Billed:
  01/06/2026 - CPT 90837 (60 min psychotherapy) - $250.00
  01/13/2026 - CPT 90837 (60 min psychotherapy) - $250.00
  01/20/2026 - CPT 90834 (45 min psychotherapy) - $200.00
  01/25/2026 - CPT 90837 (60 min psychotherapy) - $250.00
  01/25/2026 - CPT 90785 (interactive complexity add-on) - $45.00
Diagnosis: F33.1 Major depressive disorder, recurrent, moderate
  F41.1 Generalized anxiety disorder
Total Charges: $995.00
Authorization: BH-AUTH-2026-5589 (approved 24 sessions)
Sessions Used: 4 of 24`,
    mime: 'text/plain'
  },
  {
    name: `r2_phoenix_auto_pip_${ts}.txt`,
    category: 'auto_pip',
    content: `ARIZONA PERSONAL INJURY PROTECTION CLAIM
Claim #: AZ-PIP-2026-019283
Date of Accident: 01/15/2026  Time: 08:22 AM
Location: I-10 & 43rd Ave, Phoenix AZ
Insured: Thomas Garcia  DOB: 05/28/1985
Policy: STATE-FARM-AZ-4471002  Effective: 07/01/2025 - 07/01/2026
Vehicle: 2023 Toyota Camry  VIN: 4T1B11HK8PU000123
Accident Type: Rear-end collision at traffic signal
Police Report: PHX-2026-001847
Injuries Sustained:
  - Cervical strain/whiplash (ICD-10: S13.4XXA)
  - Thoracic spine contusion (ICD-10: S20.219A)
  - Right knee contusion (ICD-10: S80.01XA)
Treatment Provider: Southwest Spine & Pain Center
Treating MD: Dr. Kevin Patel  NPI: 5551234567
Treatment Plan: Physical therapy 3x/week x 8 weeks, chiropractic 2x/week
Estimated Medical: $8,500.00
PIP Coverage Limit: $15,000.00
Lost Wages Claim: $4,200.00 (2 weeks missed work)
Employer Verification: Attached - Desert Sun Landscaping LLC`,
    mime: 'text/plain'
  },
  {
    name: `r2_seattle_home_insurance_${ts}.txt`,
    category: 'property',
    content: `HOMEOWNERS INSURANCE CLAIM - WATER DAMAGE
Carrier: Allstate Insurance Company
Policy #: ALL-WA-HO3-8823456
Claim #: CLM-WA-2026-007712
Insured: Jennifer & Mark Thompson
Property: 4521 NE 45th Street, Seattle WA 98105
Date of Loss: 01/18/2026
Date Reported: 01/19/2026
Cause of Loss: Burst pipe during freezing temperatures
Damage Description:
  - Kitchen ceiling collapse (approx 120 sq ft)
  - Water damage to hardwood flooring in kitchen and dining room
  - Damaged kitchen cabinets (lower section, 8 linear feet)
  - Personal property: appliances, cookware, electronics
Adjuster: Michael Reynolds  License: WA-ADJ-44512
Field Inspection Date: 01/21/2026
Estimates:
  Structural Repair: $18,500.00
  Flooring Replacement: $7,200.00
  Cabinet Replacement: $6,800.00
  Personal Property: $3,400.00
  Emergency Mitigation: $2,800.00
  Temporary Housing (2 weeks): $3,200.00
  Total Estimated Loss: $41,900.00
Deductible: $2,500.00
Coverage A Dwelling Limit: $450,000.00
Coverage C Personal Property: $225,000.00`,
    mime: 'text/plain'
  },
  {
    name: `r2_atlanta_lab_work_${ts}.txt`,
    category: 'lab_work',
    content: `QUEST DIAGNOSTICS - LABORATORY REPORT & BILLING
Lab Order #: QD-2026-ATL-889123
Date of Collection: 01/27/2026
Patient: Patricia Lewis  DOB: 12/08/1968
Member ID: AETNA-GA-33298710  Group: GRP-DELTA-5500
Insurance: Aetna Health Inc.
Ordering Physician: Dr. William Chen, Internal Medicine
NPI: 1122334455
Collection Site: 3355 Lenox Rd NE, Atlanta GA 30326
Tests Ordered and Results:
  80053 - Comprehensive Metabolic Panel - $142.00
    Glucose: 118 mg/dL (H)  BUN: 22  Creatinine: 1.1
    Sodium: 141  Potassium: 4.2  Calcium: 9.8
  83036 - Hemoglobin A1c - $68.00
    Result: 6.8% (H) - Pre-diabetic range
  80061 - Lipid Panel - $98.00
    Total Cholesterol: 245 (H)  LDL: 162 (H)  HDL: 42 (L)
    Triglycerides: 205 (H)
  85025 - CBC with Differential - $52.00
    WBC: 7.2  RBC: 4.8  Hgb: 14.2  Plt: 225
  84443 - TSH - $78.00
    Result: 2.4 mIU/L (Normal)
Diagnosis: E11.65 Type 2 diabetes with hyperglycemia
  E78.5 Hyperlipidemia
Total Charges: $438.00
Patient Responsibility: $45.00 copay`,
    mime: 'text/plain'
  },
  {
    name: `r2_denver_ski_injury_${ts}.txt`,
    category: 'fnol',
    content: `FIRST NOTICE OF LOSS - SKI ACCIDENT
Insurance Company: USAA
Policy: USAA-CO-PER-6612345
Claim #: USAA-2026-SKI-00419
Date of Incident: 01/25/2026  Time: 13:15 MST
Location: Vail Mountain Resort, Vail CO 81657
  Run: Blue Sky Basin - Pete's Express
Insured: Captain James Mitchell, USAF (Ret.)
DOB: 04/17/1980  Member Since: 2002
Description: While skiing advanced terrain, struck an unmarked ice patch.
  Lost control at estimated 35mph. Impacted tree at edge of run.
  Ski patrol responded within 4 minutes. Transported by toboggan to base.
Injuries:
  - ACL tear, right knee (ICD-10: S83.511A)
  - Tibial plateau fracture, right (ICD-10: S82.101A)
  - Rib fractures, right 5th-7th (ICD-10: S22.32XA)
Emergency Transport: Vail Valley Medical Center
Attending: Dr. Robert Steadman III, Orthopedic Surgery
Surgery: ACL reconstruction + ORIF tibial plateau - 01/26/2026
Estimated Medical Costs: $62,000.00
Personal Liability: Investigating resort maintenance records
Equipment Damage: Skis ($1,200), poles ($180), helmet ($350)
Total Equipment Loss: $1,730.00`,
    mime: 'text/plain'
  },
  {
    name: `r2_nj_pharmacy_claim_${ts}.txt`,
    category: 'pharmacy',
    content: `PHARMACY BENEFIT CLAIM - CVS CAREMARK
PBM: CVS Caremark
Claim Date: 01/29/2026
Patient: Anthony Russo  DOB: 02/14/1955
Member ID: CVS-NJ-88123456  RxBIN: 004336
RxGRP: AETNA-RX-900  Carrier: Aetna Rx
Pharmacy: CVS Pharmacy #3312
  450 Broad St, Newark NJ 07102  NPI: 1881234567
Prescribing MD: Dr. Maria Santos, Cardiology
  NPI: 1991234567

Prescriptions Filled:
  Rx#: 7712345 - Eliquis 5mg (apixaban) - #60 - 30 day supply
    NDC: 00003-0893-21  DAW: 0
    AWP: $548.00  Plan Pays: $498.00  Copay: $50.00
  Rx#: 7712346 - Metoprolol Succinate ER 50mg - #30 - 30 day supply
    NDC: 00093-7366-56  DAW: 1 (generic available)
    AWP: $42.00  Plan Pays: $32.00  Copay: $10.00
  Rx#: 7712347 - Atorvastatin 40mg - #30 - 30 day supply
    NDC: 00071-0157-23  DAW: 0
    AWP: $38.00  Plan Pays: $28.00  Copay: $10.00
  Rx#: 7712348 - Lisinopril 20mg - #30 - 30 day supply
    NDC: 00093-1040-01  DAW: 0
    AWP: $15.00  Plan Pays: $5.00  Copay: $10.00

Total AWP: $643.00  Total Plan Paid: $563.00  Total Copay: $80.00
Diagnosis: I48.91 Atrial fibrillation  I10 Essential hypertension
  E78.5 Hyperlipidemia`,
    mime: 'text/plain'
  },
  {
    name: `r2_portland_naturopathic_${ts}.txt`,
    category: 'alternative_medicine',
    content: `PORTLAND INTEGRATIVE HEALTH CENTER
Naturopathic Medicine & Acupuncture
2100 NW Lovejoy St, Portland OR 97210
Patient: Samantha Green  DOB: 08/30/1990
Insurance: Providence Health Plan  ID: PHP-OR-55671234
Date of Service: 01/24/2026
Provider: Dr. Emily Watkins, ND, LAc  NPI: 2233445566
License: ND-OR-1892  Acupuncture: LAc-OR-4456

Services Rendered:
  99214 - Office visit, established patient, moderate - $185.00
  97810 - Acupuncture, initial 15 minutes - $95.00
  97811 - Acupuncture, additional 15 min (x2) - $140.00
  97140 - Manual therapy, 15 min - $75.00
  99080 - Supplement/nutraceutical consult - $65.00

Supplements Dispensed (not covered by insurance):
  Curcumin PhytoSome 500mg - $42.00
  Magnesium Glycinate 400mg - $28.00
  Omega-3 EPA/DHA 2000mg - $36.00

Diagnosis: M54.5 Low back pain
  G43.909 Migraine, unspecified
  K58.9 Irritable bowel syndrome
Total Medical Charges: $560.00
Total Supplements: $106.00
Insurance Billable: $560.00  Copay: $40.00`,
    mime: 'text/plain'
  },
  {
    name: `r2_houston_dme_claim_${ts}.txt`,
    category: 'dme',
    content: `DURABLE MEDICAL EQUIPMENT CLAIM
Supplier: Gulf Coast Medical Supply Inc.
  8900 Westheimer Rd, Houston TX 77063
  NPI: 3344556677  PTAN: TX-DME-44521
Claim Date: 01/31/2026
Patient: Harold Washington  DOB: 06/20/1948
Member ID: HUMANA-TX-90234567  Group: GRP-RETIRE-2200
Insurance: Humana Medicare Advantage
Ordering Physician: Dr. Angela Brooks, Pulmonology
  NPI: 4455667788

Equipment Ordered:
  E0431 - Portable oxygen concentrator - $2,800.00
    Rental: $280.00/month x 13 months then purchase
    HCPCS: E0431  Modifier: RR (rental)
    CMN: Attached - O2 sat 86% on room air
  E0601 - CPAP device with humidifier - $1,200.00
    AHI: 32 events/hour (severe OSA documented)
  A7030 - CPAP full face mask - $185.00
  A7038 - CPAP disposable filter (6-pack) - $24.00
  A7046 - Water chamber for humidifier - $45.00

Diagnosis: J44.1 COPD with acute exacerbation
  G47.33 Obstructive sleep apnea
  J96.11 Chronic respiratory failure with hypoxia
Total Charges: $4,254.00
Medicare Allowed: $3,410.00
Patient 20% Coinsurance: $682.00
Certificate of Medical Necessity: Attached
ABN: Signed 01/30/2026`,
    mime: 'text/plain'
  },
  {
    name: `r2_san_diego_vision_${ts}.txt`,
    category: 'vision',
    content: `SAN DIEGO EYE INSTITUTE
Vision Care Claim
4200 La Jolla Village Dr, San Diego CA 92122
Date: 01/23/2026
Patient: Lisa Chang  DOB: 11/05/1983
Insurance: VSP Vision  ID: VSP-CA-22198765
Employer Group: TechCorp Global - GRP-TECH-8800
Provider: Dr. James Henderson, OD  NPI: 5566778899
License: OPT-CA-12890

Examination & Services:
  92014 - Comprehensive eye exam, established patient - $195.00
  92015 - Refraction determination - $45.00
  S0580 - Contact lens fitting, established wearer - $120.00
  V2100 - Sphere, single vision, per lens (x2) - $180.00
  V2623 - Polycarbonate lens (x2) - $90.00
  V2744 - Tint, photochromic per lens (x2) - $80.00
  V2020 - Frame, purchases - $225.00

Rx: OD -3.25 -0.75 x 180  OS -3.00 -0.50 x 175
  Add +1.25 (early presbyopia noted)
Contact Lens Rx: Acuvue Oasys 1-Day
  OD -3.25 BC 8.5 DIA 14.3
  OS -3.00 BC 8.5 DIA 14.3

Diagnosis: H52.11 Myopia, bilateral
  H52.223 Regular astigmatism, bilateral
  H52.4 Presbyopia
Total Charges: $935.00
VSP Allowance: $620.00  Patient Balance: $315.00`,
    mime: 'text/plain'
  },
  {
    name: `r2_nashville_substance_abuse_${ts}.txt`,
    category: 'behavioral_health',
    content: `CUMBERLAND RECOVERY CENTER
Substance Abuse Treatment - Outpatient Services
1800 Church St, Nashville TN 37203
CONFIDENTIAL - 42 CFR Part 2 Protected

Patient ID: CRC-2026-ANON-4478 (De-identified per Federal Regulations)
Insurance: Cigna Behavioral Health  ID: CIGNA-TN-44567890
Group: GRP-MUSIC-3300  Auth: BH-AUTH-2026-8891
Treatment Dates: 01/06/2026 - 01/31/2026

Services Rendered:
  H0015 - Intensive Outpatient Program, per hour (60 hrs) - $7,200.00
    Schedule: Mon/Wed/Fri 9am-1pm x 5 weeks
  90837 - Individual psychotherapy, 60 min (4 sessions) - $1,000.00
  90847 - Family therapy with patient, 50 min (2 sessions) - $400.00
  H0048 - Alcohol/drug screening (4 tests) - $240.00
  99213 - Medication management visit (2 visits) - $300.00

Diagnosis: F10.20 Alcohol dependence, uncomplicated
  F33.1 Major depressive disorder, recurrent, moderate
  F41.1 Generalized anxiety disorder
Licensed Counselor: Sarah Mitchell, LPC-MHSP  NPI: 6677889900
Medical Director: Dr. James Crawford, MD  Board Cert: Addiction Medicine
Total Charges: $9,140.00
Pre-certified Sessions: Approved through 03/31/2026`,
    mime: 'text/plain'
  },
  {
    name: `r2_buffalo_snow_roof_claim_${ts}.txt`,
    category: 'property',
    content: `HOMEOWNERS CLAIM - SNOW/ICE DAMAGE
Carrier: Erie Insurance Group
Policy: ERIE-NY-HO5-7723456  Effective: 04/01/2025 - 04/01/2026
Claim: ERIE-2026-PROP-002891
Insured: Frank & Maria Kowalski
Property: 287 Elmwood Ave, Buffalo NY 14222
Coverage: HO-5 Comprehensive Form
Date of Loss: 01/20/2026
Cause: Excessive snow load causing structural damage

Damage Assessment (Adjuster: Tom Bradley, CPCU):
  - Partial roof collapse, northeast section (400 sq ft)
  - Damaged roof trusses (3 trusses require replacement)
  - Water intrusion to 2nd floor bedroom and bathroom
  - Ceiling and drywall damage (2 rooms)
  - Damaged insulation (R-38 batts, 600 sq ft)
  - Personal property: bedroom furniture, electronics

Repair Estimates:
  Emergency tarping/shoring: $3,200.00
  Roof reconstruction: $22,500.00
  Truss replacement (3): $8,400.00
  Interior drywall/paint: $4,800.00
  Insulation replacement: $2,100.00
  Personal property: $6,200.00
  Code upgrade requirements: $3,500.00
  Total Estimated: $50,700.00
Deductible: $1,000.00  ACV Holdback: $8,200.00
Initial Payment: $41,500.00`,
    mime: 'text/plain'
  },
  {
    name: `r2_la_rideshare_accident_${ts}.txt`,
    category: 'auto',
    content: `AUTO LIABILITY CLAIM - RIDESHARE ACCIDENT
Carrier: Progressive Insurance
Policy: PROG-CA-AUTO-5598712
Claim #: PROG-2026-LA-004521
Date of Accident: 01/26/2026  Time: 19:45 PST
Location: Sunset Blvd & Vine St, Hollywood CA 90028
Police Report: LAPD-2026-012847

Insured Vehicle: 2024 Honda Accord  VIN: 1HGCV3F42RA000456
Driver: Daniel Kim  DOB: 09/12/1994  DL: CA-Y5567123
Status: Active Uber driver (trip in progress at time of collision)

Accident Description: Insured vehicle (Uber) made left turn from Sunset
onto Vine. Struck by westbound vehicle running red light. Passenger in
insured vehicle sustained injuries.

Parties Involved:
  Claimant 1 (Passenger): Ashley Torres - neck/back pain, ER visit
  Other Vehicle: 2022 BMW 330i - Driver: Kevin Price
  Third Vehicle: Parked 2021 Ford F-150 (sideswiped)

Damage Estimates:
  Insured Honda Accord: $14,200.00 (repairable)
  BMW 330i: $22,800.00 (possible total loss)
  Ford F-150: $3,100.00
Passenger Medical (initial): $4,500.00
BI Reserve: $50,000.00
Uber TNC Policy: Active Period 3 (passenger in vehicle)
Uber Policy #: UBER-JF-2026-CAL-001122`,
    mime: 'text/plain'
  },
  {
    name: `r2_minneapolis_chiro_${ts}.txt`,
    category: 'chiropractic',
    content: `TWIN CITIES CHIROPRACTIC & WELLNESS
5500 Wayzata Blvd, Minneapolis MN 55416
Superbill / Encounter Form
Date: 01/29/2026
Patient: Karen Anderson  DOB: 04/22/1978
Insurance: HealthPartners  ID: HP-MN-66712345
Group: GRP-TARGET-7700
Provider: Dr. Ryan Peterson, DC  NPI: 7788990011
License: DC-MN-5567

Chief Complaint: Low back pain radiating to left leg x 3 weeks
  Onset: Shoveling snow 01/10/2026

Services:
  99203 - New patient E/M, low complexity - $165.00
  98940 - CMT, spinal, 1-2 regions - $75.00
  98941 - CMT, spinal, 3-4 regions - $95.00
  97140 - Manual therapy, 15 min - $65.00
  97110 - Therapeutic exercise, 15 min - $55.00
  97014 - Electrical stimulation, unattended - $35.00
  72148 - MRI lumbar spine w/o contrast (ordered) - $850.00

Diagnosis: M54.41 Lumbago with sciatica, left side
  M51.16 Intervertebral disc degeneration, lumbar region
Assessment: L4-L5 disc herniation suspected. MRI ordered.
Plan: Chiropractic care 2x/week x 6 weeks. Re-eval after MRI.
Total Today: $1,340.00  Copay Collected: $30.00`,
    mime: 'text/plain'
  },
  {
    name: `r2_philly_ambulance_${ts}.txt`,
    category: 'emergency',
    content: `PHILADELPHIA FIRE DEPARTMENT - EMS BILLING
Ambulance Transport Claim
Run #: PFD-EMS-2026-004817
Date of Transport: 01/27/2026  Time: 06:12 EST
Patient: William Jackson  DOB: 01/03/1960
Insurance: Medicare Part B  HIC: 1EG4-TE5-MK72
Secondary: Keystone Blue  ID: KBS-PA-88234567
Pickup: 1200 Market St, Philadelphia PA 19107
  (Scene of fall on icy sidewalk)
Destination: Thomas Jefferson University Hospital
  111 S 11th St, Philadelphia PA 19107

Level of Service: ALS-1 Emergency (A0427)
  BLS Assessment + ALS Intervention
Mileage: 2.3 miles loaded (A0425 x 2.3)
ALS Supplies Used:
  - IV access established (A0394)
  - Cardiac monitoring (continuous)
  - Cervical collar applied
  - Splinting: right hip/femur
Crew: Paramedic Rodriguez (#4412), EMT-B Chen (#5523)

Charges:
  A0427 - ALS-1 Emergency Base Rate: $1,850.00
  A0425 - Mileage (2.3 mi x $22.00): $50.60
  A0394 - ALS Specialized Service: $280.00
  A0398 - ALS Routine Supplies: $125.00
  Total: $2,305.60
Medicare Allowable: $485.00
Patient: 20% coinsurance = $97.00
Diagnosis: S72.001A Right femoral neck fracture
  W01.0XXA Fall on same level from slipping on ice`,
    mime: 'text/plain'
  },
  {
    name: `r2_sacramento_pediatric_${ts}.txt`,
    category: 'pediatric',
    content: `SUTTER CHILDREN'S CENTER SACRAMENTO
Pediatric Outpatient Visit
Date: 01/28/2026
Patient: Emma Liu  DOB: 03/15/2020 (Age: 5)
Parent/Guardian: Wei & Michelle Liu
Insurance: Kaiser Permanente  ID: KP-CA-99234567
Group: GRP-STATE-CAL-5500
PCP: Dr. Jennifer Nakamura, Pediatrics  NPI: 8899001122

Visit Type: Well-Child Check + Sick Visit
  99393 - Preventive visit, 3-11 years - $285.00
  99213 - E/M, established, low complexity (added) - $135.00
  90707 - MMR vaccine - $85.00
  90716 - Varicella vaccine - $165.00
  90460 - Immunization admin, first component - $25.00
  90461 - Immunization admin, each additional (x3) - $45.00
  87880 - Rapid strep test - $38.00
  99173 - Visual acuity screening - $15.00

Growth: Height 42" (50th %ile)  Weight 40 lbs (45th %ile)
  BMI: 16.0 (normal)
Developmental: Meeting all milestones. Kindergarten-ready assessment positive.
Rapid Strep: POSITIVE - Group A Streptococcus
Rx: Amoxicillin 400mg/5mL, 1 tsp BID x 10 days

Diagnosis: Z00.121 Well child exam with abnormal findings
  J02.0 Streptococcal pharyngitis
Total: $793.00  Copay: $25.00`,
    mime: 'text/plain'
  },
  {
    name: `r2_detroit_auto_total_loss_${ts}.txt`,
    category: 'auto',
    content: `AUTO CLAIM - TOTAL LOSS EVALUATION
Carrier: GEICO
Policy: GEICO-MI-AUTO-3398712
Claim #: GEICO-2026-DET-001892
Date of Loss: 01/19/2026
Insured: Marcus Brown  DOB: 07/14/1991
Vehicle: 2021 Chevrolet Equinox LT AWD
  VIN: 2GNAXUEV7M6123456
  Mileage: 48,200  Color: Mosaic Black Metallic

Accident: Multi-vehicle collision on I-94 near Dearborn
  Icy conditions, chain-reaction pileup involving 8 vehicles
  Police Report: MSP-2026-WAY-00234

Damage Assessment (Total Loss):
  Front end: Radiator, condenser, bumper, hood, both fenders
  Frame: Bent subframe, crumple zone compromised
  Airbags: Front driver/passenger deployed
  Mechanical: Engine pushed back, transmission mounts broken
  Repair Estimate: $28,400.00

Vehicle Valuation:
  NADA Clean Retail: $24,800.00
  KBB Fair Market: $23,200.00
  CCC Comparable Sales (5 vehicles): $24,100.00
  Adjusted Value: $24,200.00
  Salvage Value: $4,800.00
  Total Loss Threshold: 75% (Michigan)
  Damage/Value Ratio: 117% - TOTAL LOSS CONFIRMED

Settlement Offer: $24,200.00
  Less Deductible: -$500.00
  Less Lien (Ally Financial): -$12,400.00
  Net to Insured: $11,300.00
Rental: Enterprise - 30 days authorized @ $35/day = $1,050.00`,
    mime: 'text/plain'
  },
  {
    name: `r2_multistate_tpa_batch_${ts}.csv`,
    category: 'batch_csv',
    content: `claim_id,patient_name,dob,member_id,insurance,state,service_date,provider,cpt_codes,icd10_codes,total_charges,claim_type
TPA-R2-001,Robert Kim,1975-03-22,BCBS-NY-111234,BCBS,NY,2026-01-20,NYC Orthopedics,27447,M17.11,$42500.00,surgical
TPA-R2-002,Maria Santos,1988-11-14,UHC-FL-222345,UHC,FL,2026-01-21,Tampa General,99284;72148,S33.5XXA,$3200.00,emergency
TPA-R2-003,James O'Brien,1962-07-30,AETNA-NJ-333456,Aetna,NJ,2026-01-22,NJ Cardiology,93306;93312,I25.10,$5800.00,diagnostic
TPA-R2-004,Sarah Williams,2000-05-18,CIGNA-TX-444567,Cigna,TX,2026-01-23,Austin Women's Health,59400,O80,$18500.00,obstetric
TPA-R2-005,David Chen,1970-12-03,HP-MN-555678,HealthPartners,MN,2026-01-24,Mayo Clinic,43239,K21.0,$4200.00,gastro
TPA-R2-006,Lisa Nguyen,1995-09-25,KP-CA-666789,Kaiser,CA,2026-01-25,Kaiser Oakland,90837;90785,F33.1,$295.00,behavioral
TPA-R2-007,Michael Brown,1958-04-11,HUMANA-GA-777890,Humana,GA,2026-01-26,Emory Orthopedics,27130,M16.11,$38900.00,surgical
TPA-R2-008,Jennifer Taylor,1983-08-07,DELTA-IL-888901,Delta Dental,IL,2026-01-27,Chicago Dental Group,D2740;D2950,K02.62,$1675.00,dental`,
    mime: 'text/csv'
  },
  {
    name: `r2_hawaii_travel_insurance_${ts}.txt`,
    category: 'travel',
    content: `TRAVEL INSURANCE CLAIM
Carrier: Allianz Travel Insurance
Policy: ALLIANZ-TRAVEL-2026-001234
Plan: OneTrip Prime
Effective: 01/15/2026 - 01/30/2026
Claim #: ALZ-2026-HI-00891
Claimant: Michael & Sarah Reynolds
Home: 456 Oak Lane, Denver CO 80220

Trip Details:
  Destination: Maui, Hawaii
  Departure: 01/15/2026 DEN → OGG (United UA1847)
  Return: 01/30/2026 OGG → DEN (United UA1848)
  Trip Cost: $8,200.00 (flights, resort, activities)

Claim Events:
  1. Trip Interruption - 01/22/2026
     Reason: Sarah Reynolds - emergency appendectomy
     Hospital: Maui Memorial Medical Center
     Surgeon: Dr. Kenji Tanaka
     Procedure: Laparoscopic appendectomy (CPT 44970)
     ICD-10: K35.80 Acute appendicitis
     Medical Charges: $34,500.00
     Unused Trip Portion: $3,280.00
     Emergency Return Flight: $1,850.00 (changed tickets)
  2. Baggage Delay - 01/15/2026
     Duration: 18 hours
     Essential Purchases: $425.00 (clothing, toiletries)
     Receipts: Attached (7 items)

Total Claim Amount:
  Medical: $34,500.00
  Trip Interruption: $3,280.00
  Flight Change: $1,850.00
  Baggage Delay: $425.00
  Total: $40,055.00
Medical Coverage Max: $50,000.00
Trip Interruption Max: 100% of trip cost`,
    mime: 'text/plain'
  },
  {
    name: `r2_baltimore_dialysis_${ts}.txt`,
    category: 'medical_bill',
    content: `DAVITA KIDNEY CARE - BALTIMORE
Dialysis Treatment Billing Statement
Center: DaVita Baltimore Inner Harbor #4412
  800 S Broadway, Baltimore MD 21231
Statement Date: 01/31/2026
Patient: George Martinez  DOB: 08/15/1952
Insurance Primary: Medicare ESRD  HIC: 2FG5-TH6-NK83
Insurance Secondary: CareFirst BCBS  ID: CF-MD-77456789
Nephrologist: Dr. Priya Sharma  NPI: 9900112233

Treatment Summary - January 2026:
  Hemodialysis Sessions (13 treatments):
    90937 - HD, single evaluation (x13) - $5,850.00
    36556 - Catheter care (x4) - $600.00
    90940 - HD, additional evaluation (x3) - $450.00
  Lab Work:
    80053 - CMP (x2) - $284.00
    85025 - CBC (x2) - $104.00
    82565 - Creatinine (x4) - $120.00
    84295 - Sodium (x2) - $48.00
    84132 - Potassium (x4) - $96.00
    82330 - Calcium ionized (x2) - $76.00
    84100 - Phosphorus (x2) - $52.00
  Medications Administered:
    J0882 - Epoetin alfa, 1000u (x13 doses) - $2,340.00
    J0885 - Darbepoetin alfa (x2 doses) - $860.00
    J1756 - Iron sucrose, 100mg (x4 doses) - $520.00

Diagnosis: N18.6 End-stage renal disease
  I12.0 Hypertensive CKD, Stage 5
  D63.1 Anemia in CKD
Total Charges: $11,400.00
Medicare Composite Rate: $265.62/session x 13 = $3,453.06
Medicare Pays 80%: $2,762.45
Secondary Insurance: $690.61
Patient: $0.00 (ESRD Medicare + secondary = 100%)`,
    mime: 'text/plain'
  },
  {
    name: `r2_vegas_cosmetic_denied_${ts}.txt`,
    category: 'denial',
    content: `CLAIM DENIAL NOTICE
Insurance: Anthem Blue Cross Blue Shield of Nevada
Policy: ANTHEM-NV-PPO-5534789
Member: Jessica Adams  ID: ABCBS-NV-11234567
Date of Service: 01/15/2026
Claim #: CLM-NV-2026-DENY-00234
Provider: Las Vegas Aesthetic Surgery Center
  Dr. Michael Torres, MD  NPI: 1100223344

Denied Services:
  15822 - Blepharoplasty, upper eyelid - $4,200.00
  15823 - Blepharoplasty, lower eyelid - $3,800.00
  67900 - Repair brow ptosis - $2,600.00
  99213 - Pre-operative consultation - $185.00

Denial Reason: Services determined to be cosmetic in nature (NOT medically necessary)
Denial Code: CO-50 (Non-covered service)
CARC: 96 - Non-covered charge(s)

Clinical Review Notes:
  - No documented visual field impairment
  - No functional deficit demonstrated
  - Photography review: age-appropriate appearance
  - Does not meet Anthem Medical Policy BLP-023 criteria
  - Peer review: Dr. Sandra Kim, Ophthalmology

Appeal Rights:
  Internal Appeal: Must be filed within 180 days of this notice
  External Review: Available after internal appeal exhaustion
  Contact: Anthem Appeals, PO Box 54159, Las Vegas NV 89155
  Phone: 1-800-555-0123
Total Denied: $10,785.00
Member Financial Responsibility: $10,785.00 if not appealed`,
    mime: 'text/plain'
  },
  {
    name: `r2_charlotte_urgent_care_${ts}.txt`,
    category: 'urgent_care',
    content: `MEDEXPRESS URGENT CARE
4521 South Blvd, Charlotte NC 28209
Date of Visit: 01/30/2026  Time: 10:15 AM
Patient: Amanda Foster  DOB: 06/17/1996
Insurance: Medcost/BCBS NC  ID: BCBSNC-33456789
Group: GRP-WELLS-FARGO-9900
PCP: Dr. Robert Chang (notified)
Provider Seen: Dr. Brittany Mills, PA-C  NPI: 2211334455

Chief Complaint: Sore throat, fever x 3 days, cough
Vitals: T 101.2F  HR 92  BP 118/76  SpO2 98%
History: No known allergies. No chronic conditions. Non-smoker.

Examination:
  HEENT: Pharyngeal erythema with exudates bilateral. TMs clear.
  Neck: Tender anterior cervical lymphadenopathy
  Lungs: Clear bilateral, no wheezes/rales
  Assessment: Acute pharyngitis, likely streptococcal

Tests Performed:
  87880 - Rapid strep antigen test: POSITIVE
  87081 - Culture, throat (sent to lab for confirmation)

Treatment:
  Rx: Amoxicillin 500mg #30, 1 capsule TID x 10 days
  Rx: Ibuprofen 600mg #20, 1 tab Q6H PRN
  Return if: Symptoms worsen, difficulty swallowing, rash

Procedure Codes:
  99203 - New patient, low complexity - $175.00
  87880 - Rapid strep test - $38.00
  87081 - Culture, screening - $32.00
Diagnosis: J02.0 Streptococcal pharyngitis
Total: $245.00  Copay Collected: $35.00`,
    mime: 'text/plain'
  }
];

async function run() {
  console.log('='.repeat(70));
  console.log('  CLARIFYOPS - ROUND 2 DIVERSE CLAIMS TEST');
  console.log('  Testing AI extraction with refreshed API key');
  console.log('  ' + new Date().toISOString());
  console.log('='.repeat(70));
  console.log(`\n  Total claims to test: ${claims.length}`);

  const token = await login();
  console.log('  Login successful!\n');

  const results = {
    total: claims.length,
    uploaded: 0,
    uploadFailed: 0,
    extracted: 0,
    extractFailed: 0,
    details: []
  };

  for (let i = 0; i < claims.length; i++) {
    const claim = claims[i];
    console.log(`\n[${i + 1}/${claims.length}] ${claim.name} (${claim.category})`);

    const uploadResult = await uploadClaim(token, claim.name, claim.content, claim.mime);

    if (!uploadResult.success) {
      console.log(`  UPLOAD FAILED: ${uploadResult.error}`);
      results.uploadFailed++;
      results.details.push({
        file: claim.name,
        category: claim.category,
        upload: 'FAILED',
        error: uploadResult.error
      });
      await new Promise(r => setTimeout(r, 500));
      continue;
    }

    console.log(`  Uploaded -> ID: ${uploadResult.id}, Type: ${uploadResult.docType}`);
    results.uploaded++;

    console.log(`  Extracting fields...`);
    const extractResult = await extractFields(token, uploadResult.id);

    if (!extractResult.success) {
      console.log(`  EXTRACT FAILED: ${extractResult.error}`);
      results.extractFailed++;
      results.details.push({
        file: claim.name,
        category: claim.category,
        upload: 'OK',
        docId: uploadResult.id,
        docType: uploadResult.docType,
        extraction: 'FAILED',
        error: extractResult.error
      });
    } else {
      const fieldCount = typeof extractResult.fields === 'object'
        ? Object.keys(extractResult.fields).length
        : 0;
      console.log(`  EXTRACTED ${fieldCount} fields`);
      results.extracted++;
      results.details.push({
        file: claim.name,
        category: claim.category,
        upload: 'OK',
        docId: uploadResult.id,
        docType: uploadResult.docType,
        extraction: 'OK',
        fieldCount,
        fields: extractResult.fields
      });
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n' + '='.repeat(70));
  console.log('  ROUND 2 TEST RESULTS SUMMARY');
  console.log('='.repeat(70));
  console.log(`  Total Claims:       ${results.total}`);
  console.log(`  Uploads Successful: ${results.uploaded}`);
  console.log(`  Uploads Failed:     ${results.uploadFailed}`);
  console.log(`  Extractions OK:     ${results.extracted}`);
  console.log(`  Extractions Failed: ${results.extractFailed}`);
  console.log(`  Success Rate:       ${((results.extracted / results.total) * 100).toFixed(1)}%`);

  console.log('\n  DOCUMENT TYPE DISTRIBUTION:');
  const typeMap = {};
  results.details.forEach(d => {
    if (d.docType) {
      typeMap[d.docType] = (typeMap[d.docType] || 0) + 1;
    }
  });
  Object.entries(typeMap).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`    ${type.padEnd(25)} ${count}`);
  });

  console.log('\n  CATEGORY BREAKDOWN:');
  const catMap = {};
  results.details.forEach(d => {
    catMap[d.category] = (catMap[d.category] || 0) + 1;
  });
  Object.entries(catMap).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`    ${cat.padEnd(25)} ${count}`);
  });

  const failedOnes = results.details.filter(d => d.upload === 'FAILED' || d.extraction === 'FAILED');
  if (failedOnes.length > 0) {
    console.log('\n  FAILURES:');
    failedOnes.forEach(d => {
      console.log(`    ${d.file}: ${d.error || 'Unknown error'}`);
    });
  }

  console.log('\n  DETAILED EXTRACTION RESULTS:');
  results.details.filter(d => d.extraction === 'OK').forEach(d => {
    console.log(`\n  --- ${d.file} (ID: ${d.docId}, Type: ${d.docType}) ---`);
    if (d.fields && typeof d.fields === 'object') {
      if (Array.isArray(d.fields)) {
        d.fields.forEach(f => {
          const label = f.label || f.name || f.key || 'unknown';
          const val = f.value || f.extracted || '';
          console.log(`    ${String(label).padEnd(30)} ${String(val).substring(0, 60)}`);
        });
      } else {
        Object.entries(d.fields).forEach(([k, v]) => {
          console.log(`    ${k.padEnd(30)} ${String(v).substring(0, 60)}`);
        });
      }
    }
  });

  console.log('\n' + '='.repeat(70));
  console.log('  ROUND 2 TEST COMPLETE');
  console.log('='.repeat(70));

  const reportPath = path.join(__dirname, '..', 'test-results-round2.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n  Full results saved to: ${reportPath}`);
}

run().catch(err => {
  console.error('Test script failed:', err);
  process.exit(1);
});
