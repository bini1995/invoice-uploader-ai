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

const claims = [
  {
    name: 'nyc_ortho_medical_bill.txt',
    type: 'text/plain',
    category: 'medical_bill',
    content: `NYC ORTHOPEDIC ASSOCIATES, PC
1245 Park Avenue, Suite 300
New York, NY 10128
NPI: 1234567890 | Tax ID: 13-4567890

MEDICAL BILL / STATEMENT OF SERVICES
========================================
Statement Date: 01/15/2026
Account #: NYC-ORT-88412

PATIENT INFORMATION:
  Name: Margaret Chen
  DOB: 03/22/1978
  Member ID: BCBS-NY-445201
  Insurance: Empire BlueCross BlueShield
  Policy #: GRP-2024-887654
  Group #: EMPL-5543

REFERRING PHYSICIAN: Dr. Anthony Russo, MD

SERVICES RENDERED:
Date        CPT Code    Description                        Charges
01/10/2026  99214       Office Visit, Estab Patient        $285.00
01/10/2026  73721       MRI Lower Extremity w/o Contrast   $1,450.00
01/12/2026  20610       Arthrocentesis, Major Joint        $475.00

DIAGNOSIS CODES:
  M17.11 - Primary osteoarthritis, right knee
  M25.561 - Pain in right knee

Total Charges:    $2,210.00
Insurance Paid:   $1,445.00
Patient Copay:    $75.00
Balance Due:      $690.00

Payment due within 30 days. Questions? Call (212) 555-0187`
  },
  {
    name: 'florida_urgent_care_claim.txt',
    type: 'text/plain',
    category: 'medical_bill',
    content: `SUNSHINE STATE URGENT CARE CENTER
8900 W Flagler St, Miami, FL 33174
Phone: (305) 555-0234 | Fax: (305) 555-0235
NPI: 9876543210 | License #: FL-UC-2019-4421

INSURANCE CLAIM FORM
Date of Service: 12/28/2025

Patient: Carlos Rivera-Martinez
DOB: 11/05/1985
SSN: XXX-XX-4523
Address: 2340 Coral Way, Apt 12B, Miami, FL 33145

Insurance Provider: Aetna
Policy Number: W330985671
Group Number: FLS-CORP-221
Subscriber: Carlos Rivera-Martinez
Relationship: Self

Treating Physician: Dr. Maria Santos, DO
Facility: Sunshine State Urgent Care Center

PROCEDURES PERFORMED:
CPT 99283 - Emergency Dept Visit, Moderate       $650.00
CPT 87880 - Strep Test, Rapid                    $45.00
CPT 71046 - Chest X-Ray, 2 Views                 $225.00
CPT 96372 - Therapeutic Injection, SubQ/IM        $85.00

DIAGNOSES:
J06.9 - Acute upper respiratory infection
J02.9 - Acute pharyngitis, unspecified
R50.9 - Fever, unspecified

TOTAL BILLED: $1,005.00

Provider Signature: Dr. Maria Santos, DO
Date: 12/28/2025`
  },
  {
    name: 'texas_workers_comp_fnol.txt',
    type: 'text/plain',
    category: 'fnol_form',
    content: `TEXAS DEPARTMENT OF INSURANCE
DIVISION OF WORKERS' COMPENSATION
EMPLOYER'S FIRST REPORT OF INJURY OR ILLNESS (DWC FORM-001)

Filing Date: 01/20/2026
Carrier Claim #: TXW-2026-001547

1. EMPLOYER INFORMATION:
   Name: Gulf Coast Construction LLC
   Address: 4500 Navigation Blvd, Houston, TX 77011
   FEIN: 76-3345678
   SIC Code: 1542
   Policy #: WC-TX-2025-884321
   Carrier: Texas Mutual Insurance Company

2. EMPLOYEE/CLAIMANT INFORMATION:
   Name: James Robert Whitfield
   DOB: 06/14/1990
   SSN: XXX-XX-8876
   Occupation: Structural Iron Worker
   Hire Date: 03/15/2023
   Weekly Wage: $1,250.00

3. INCIDENT DETAILS:
   Date of Injury: 01/18/2026
   Time: 10:45 AM
   Location: Construction Site - 1200 Travis St, Houston TX
   County: Harris
   Nature of Injury: Fall from scaffold - fractured left tibia
   Body Part: Left leg, lower
   Cause: Fall from elevation (approximately 12 feet)
   
4. MEDICAL TREATMENT:
   Initial Treatment: Emergency Room - Memorial Hermann Hospital
   Treating Physician: Dr. Kevin Park, MD
   Hospital Address: 6411 Fannin, Houston, TX 77030
   
   CPT Codes: 27752, 99283, 73592
   ICD-10 Codes: S82.101A, W11.XXXA

5. LOST TIME:
   Last Day Worked: 01/18/2026
   Date Disability Began: 01/18/2026
   Expected Return to Work: 04/15/2026
   
   Estimated Total Medical: $45,800.00
   Estimated Lost Wages: $15,000.00

Filed By: Sarah Mitchell, HR Director
Signature: ____________________
Date: 01/20/2026`
  },
  {
    name: 'nj_auto_insurance_claim.txt',
    type: 'text/plain',
    category: 'claim_invoice',
    content: `NEW JERSEY PERSONAL INJURY PROTECTION (PIP) CLAIM
===================================================
NJ Department of Banking and Insurance
Form NJPIP-2026

Claim Number: NJ-PIP-2026-03892
Date of Loss: 12/02/2025

INSURED INFORMATION:
  Name: Priya Sharma
  Address: 78 Elm Street, Edison, NJ 08817
  Phone: (732) 555-0198
  Policy #: NJA-2025-776543
  Carrier: Plymouth Rock Assurance
  
ACCIDENT DETAILS:
  Location: Route 1 South at College Ave, New Brunswick, NJ
  Police Report #: NBPD-2025-44521
  Other Vehicle: 2022 Toyota Camry, NJ Plate ABC-1234
  
MEDICAL PROVIDERS AND CHARGES:
  
Provider 1: Robert Wood Johnson University Hospital
  Date: 12/02/2025
  CPT: 99284 (ED Visit, High Severity)     $1,890.00
  CPT: 72141 (MRI Cervical Spine w/o)       $2,100.00
  CPT: 72148 (MRI Lumbar Spine w/o)          $2,100.00
  ICD-10: S13.4XXA, S33.5XXA, M54.2
  
Provider 2: Garden State Physical Therapy
  Dates: 12/15/2025 - 01/20/2026 (15 visits)
  CPT: 97110 x15 (Therapeutic Exercise)     $1,125.00
  CPT: 97140 x10 (Manual Therapy)             $750.00
  CPT: 97530 x8 (Therapeutic Activities)      $640.00
  
Provider 3: NJ Pain & Spine Center
  Date: 01/05/2026
  CPT: 99213 (Office Visit)                   $195.00
  CPT: 64483 (Epidural Injection, Lumbar)    $2,800.00
  ICD-10: M54.5, G89.29

TOTAL PIP CLAIM AMOUNT: $11,600.00
PIP COVERAGE LIMIT: $250,000.00
DEDUCTIBLE: $500.00
NET AMOUNT DUE: $11,100.00

Claimant Signature: ____________________
Date: 01/22/2026`
  },
  {
    name: 'california_dental_claim.txt',
    type: 'text/plain',
    category: 'medical_bill',
    content: `PACIFIC COAST DENTAL GROUP
2200 Ocean Park Blvd, Suite 400
Santa Monica, CA 90405
Phone: (310) 555-0345 | NPI: 5678901234

ADA DENTAL CLAIM FORM
======================
Date: 01/08/2026

SUBSCRIBER/PATIENT:
  Name: Jennifer Tanaka-Williams
  DOB: 08/29/1992
  Member ID: DELT-CA-998874
  Employer: Netflix Inc.
  Insurance: Delta Dental of California
  Group #: NFLX-PPO-2025

TREATING DENTIST:
  Dr. Robert Kim, DDS
  License #: CA-DDS-55432

PROCEDURES:
Date        CDT Code    Tooth#  Surface   Description                    Fee
01/08/2026  D0120       --      --        Periodic Oral Evaluation       $65.00
01/08/2026  D0274       --      --        Bitewings - Four Films         $85.00
01/08/2026  D1110       --      --        Prophylaxis - Adult            $145.00
01/08/2026  D2391       14      MO        Resin Composite - 2 Surfaces   $285.00
01/08/2026  D2740       30      --        Crown - Porcelain/Ceramic      $1,350.00

DIAGNOSIS:
  K02.51 - Dental caries on pit/fissure surface
  K03.1 - Abrasion of teeth

Total Charges:            $1,930.00
Insurance Estimate:       $1,250.00
Patient Responsibility:   $680.00

Dentist Signature: Dr. Robert Kim, DDS`
  },
  {
    name: 'ohio_hospital_inpatient_bill.txt',
    type: 'text/plain',
    category: 'medical_bill',
    content: `CLEVELAND CLINIC FOUNDATION
9500 Euclid Avenue
Cleveland, OH 44195
Tax ID: 34-0714585 | NPI: 1679576722

HOSPITAL INPATIENT STATEMENT
================================
Account #: CCF-2026-114587
Statement Date: 01/25/2026

PATIENT:
  Name: William David Thompson
  DOB: 01/30/1955
  MRN: CC-7789012
  Admission Date: 01/15/2026
  Discharge Date: 01/20/2026 (5 days)
  Room: 4-West, Bed 412A
  
INSURANCE:
  Primary: Medicare Part A
  Medicare ID: 1EG4-TE5-MK76
  Secondary: AARP Medigap Plan G
  Policy #: MG-OH-445201

ATTENDING: Dr. Steven Nissen, MD, FACC
ADMITTING DX: I21.09 - STEMI, unspecified site

SERVICES & CHARGES:
Revenue Code  Description                          Days/Units   Total
0120          Room & Board, Semi-Private           5            $12,500.00
0250          Pharmacy                             --           $4,875.00
0260          IV Solutions                         --           $1,200.00
0300          Laboratory                           --           $3,450.00
0320          Radiology - Diagnostic               --           $2,100.00
0360          Operating Room                       1            $8,750.00
0370          Anesthesia                           1            $3,200.00
0481          Cardiology - Cardiac Cath Lab        1            $15,600.00
0636          Drugs/Biologicals                    --           $2,890.00
0730          EKG/ECG                              3            $450.00

DRG: 247 - Perc Cardiovascular Proc w Drug-Eluting Stent

CPT: 92928 (Percutaneous Coronary Stent)
CPT: 93458 (Left Heart Cath w/ Ventriculography)
ICD-10: I21.09, I25.10, E78.5, I10

TOTAL CHARGES:           $55,015.00
Medicare DRG Payment:    $28,450.00
Medigap Payment:         $5,200.00
Patient Responsibility:  $1,556.00

Billing Questions: (216) 444-2200`
  },
  {
    name: 'wa_state_behavioral_health.txt',
    type: 'text/plain',
    category: 'medical_bill',
    content: `PUGET SOUND BEHAVIORAL HEALTH ASSOCIATES
1400 Madison Street, Suite 200
Seattle, WA 98104
NPI: 4567890123 | Tax ID: 91-2345678

MENTAL HEALTH OUTPATIENT CLAIM
================================
Claim Date: 01/18/2026

CLIENT INFORMATION:
  Name: David Nakamura
  DOB: 04/12/1988
  Insurance: Premera Blue Cross
  Member ID: PBC-WA-332145
  Policy: AMZN-BH-2025
  Group: Amazon EAP Extended

PROVIDER:
  Name: Dr. Lisa Hernandez, PhD, LP
  Specialty: Clinical Psychology
  License #: WA-PSY-PL-6012
  Taxonomy: 103T00000X

SERVICES:
Date        CPT      Modifier  Description                      Rate
01/04/2026  90837    --        Psychotherapy, 60 min             $225.00
01/06/2026  90847    --        Family Therapy w/ Patient         $275.00
01/11/2026  90837    --        Psychotherapy, 60 min             $225.00
01/13/2026  96130    --        Psychological Testing, 1st hr    $300.00
01/13/2026  96131    --        Psych Testing, Addtl 30 min      $150.00
01/18/2026  90837    --        Psychotherapy, 60 min             $225.00

DIAGNOSES:
  F33.1 - Major depressive disorder, recurrent, moderate
  F41.1 - Generalized anxiety disorder
  Z63.0 - Problems in relationship with spouse

Total Charges:          $1,400.00
Allowed Amount:         $1,120.00
Copay (6 visits x $30): $180.00
Plan Pays:              $940.00
Patient Owes:           $460.00

Sessions Remaining (2026 Plan Year): 18 of 30`
  },
  {
    name: 'massachusetts_pharmacy_claim.csv',
    type: 'text/csv',
    category: 'claim_invoice',
    content: `Pharmacy Name,License #,NPI,Patient Name,DOB,Member ID,Insurance,Policy #,Rx Number,Date Filled,NDC,Drug Name,Qty,Days Supply,Prescriber,DEA#,CPT,ICD-10,AWP,Copay,Plan Paid,Total
CVS Pharmacy #4521,MA-PH-22134,3456789012,Robert O'Brien,07/15/1960,HPHC-MA-556789,Harvard Pilgrim Health Care,HPHC-2025-334455,RX-8845213,01/12/2026,00006-0277-31,Januvia 100mg,30,30,Dr. Amit Patel MD,AP1234567,99070,E11.65,$485.00,$45.00,$380.00,$425.00
CVS Pharmacy #4521,MA-PH-22134,3456789012,Robert O'Brien,07/15/1960,HPHC-MA-556789,Harvard Pilgrim Health Care,HPHC-2025-334455,RX-8845214,01/12/2026,00093-7180-01,Lisinopril 20mg,90,90,Dr. Amit Patel MD,AP1234567,99070,I10,$32.00,$10.00,$12.00,$22.00
CVS Pharmacy #4521,MA-PH-22134,3456789012,Robert O'Brien,07/15/1960,HPHC-MA-556789,Harvard Pilgrim Health Care,HPHC-2025-334455,RX-8845215,01/12/2026,00591-0405-01,Atorvastatin 40mg,90,90,Dr. Amit Patel MD,AP1234567,99070,E78.5,$45.00,$10.00,$25.00,$35.00
CVS Pharmacy #4521,MA-PH-22134,3456789012,Robert O'Brien,07/15/1960,HPHC-MA-556789,Harvard Pilgrim Health Care,HPHC-2025-334455,RX-8845216,01/12/2026,00378-1800-01,Metformin 1000mg,60,30,Dr. Amit Patel MD,AP1234567,99070,E11.65,$18.00,$5.00,$8.00,$13.00`
  },
  {
    name: 'georgia_chiropractic_superbill.txt',
    type: 'text/plain',
    category: 'medical_bill',
    content: `PEACHTREE CHIROPRACTIC & WELLNESS CENTER
3350 Peachtree Road NE, Suite 1200
Atlanta, GA 30326
Phone: (404) 555-0567 | NPI: 6789012345

CHIROPRACTIC SUPERBILL
========================
Date of Service: 01/14/2026

PATIENT:
  Name: Angela Simone Richardson
  DOB: 09/18/1975
  Insurance: United Healthcare
  Member ID: UHC-GA-889012
  Policy #: UHC-2025-CORP-771
  Employer: Coca-Cola Company

PROVIDER: Dr. Marcus Brown, DC
License #: GA-DC-008834

SUBJECTIVE: Patient reports chronic lower back pain (7/10) radiating to left hip.
  Duration: 6 months. Aggravated by prolonged sitting.

PROCEDURES:
[X] 98940  CMT Spinal, 1-2 Regions              $85.00
[X] 98941  CMT Spinal, 3-4 Regions              $110.00
[X] 97110  Therapeutic Exercise, 15 min          $65.00
[X] 97140  Manual Therapy, 15 min                $75.00
[X] 97014  Electrical Stimulation, Unattended    $45.00
[ ] 97012  Mechanical Traction
[ ] 97035  Ultrasound

DIAGNOSES:
[X] M54.5   Low back pain
[X] M54.41  Lumbago with sciatica, right side
[X] M99.03  Segmental dysfunction, lumbar

TOTAL: $380.00
Copay Collected: $40.00
Balance to Insurance: $340.00

Visit # 8 of 24 authorized
Next Visit: 01/21/2026

Provider Signature: Dr. Marcus Brown, DC`
  },
  {
    name: 'ny_workers_comp_c4.txt',
    type: 'text/plain',
    category: 'claim_invoice',
    content: `NEW YORK STATE WORKERS' COMPENSATION BOARD
DOCTOR'S REPORT OF MMI / PERMANENT IMPAIRMENT
FORM C-4 (Rev. 2024)

WCB Case #: G-2025-8871234
Carrier Case #: NYWC-2025-99182
Carrier: New York State Insurance Fund (NYSIF)

CLAIMANT:
  Name: Michael Anthony Petrosino
  DOB: 02/28/1982
  SSN: XXX-XX-5567
  Address: 45-12 Queens Blvd, Sunnyside, NY 11104
  Occupation: Electrician
  Employer: ConEdison
  Date of Accident: 08/15/2025

TREATING PHYSICIAN:
  Name: Dr. Raj Gupta, MD
  Specialty: Orthopedic Surgery
  Address: 30-50 Whitestone Expressway, Flushing, NY 11354
  NPI: 7890123456
  WCB Auth #: NY-WC-DR-22145

DIAGNOSIS:
  1. M75.110 - Incomplete rotator cuff tear, right shoulder
  2. S43.401A - Unspecified sprain of right shoulder
  3. M79.604 - Pain in right leg

TREATMENT PROVIDED:
Date        CPT Code   Description                        Fee (WCB Schedule)
09/01/2025  99213      Office Visit                       $86.78
09/15/2025  73221      MRI Shoulder w/o Contrast          $440.00
10/01/2025  29827      Arthroscopic Rotator Cuff Repair   $4,500.00
10/01/2025  29826      Arthroscopic Decompression         $2,100.00
11/01/2025  97110 x12  Therapeutic Exercise               $588.00
11/01/2025  97140 x8   Manual Therapy                     $392.00
01/10/2026  99214      Follow-up Visit                    $115.00

TOTAL CHARGES (WCB Fee Schedule): $8,221.78

DISABILITY STATUS:
  Total Disability: 08/15/2025 - 12/01/2025
  Partial Disability: 12/01/2025 - Present
  SLU Rating: 25% Schedule Loss of Use, Right Arm
  
  Claimant may return to modified duty.

Physician Signature: ____________________
Date: 01/10/2026`
  },
  {
    name: 'il_auto_property_damage.txt',
    type: 'text/plain',
    category: 'fnol_form',
    content: `STATE FARM MUTUAL AUTOMOBILE INSURANCE COMPANY
PROPERTY DAMAGE CLAIM REPORT
One State Farm Plaza, Bloomington, IL 61710

Claim Number: SF-IL-2026-220145
Policy Number: 123-4567-B18-44Q
Date of Loss: 01/05/2026
Date Reported: 01/06/2026

POLICYHOLDER:
  Name: Karen Elizabeth Mitchell
  Address: 1520 W Addison Street, Chicago, IL 60613
  Phone: (773) 555-0412
  Email: karen.mitchell@email.com
  
VEHICLE INFORMATION:
  Year/Make/Model: 2023 Honda CR-V EX-L
  VIN: 2HKRW2H83NH123456
  Plate: IL AB 4567
  Mileage: 28,450
  Lien Holder: Chase Auto Finance

INCIDENT DESCRIPTION:
  Location: Intersection of Lake Shore Dr & Belmont Ave, Chicago, IL
  Weather: Snow/Ice
  Police Report: CPD #JE-445892
  
  Vehicle was rear-ended while stopped at red light. Damage to
  rear bumper, trunk lid, tail lights, and exhaust system.
  No injuries reported. Other driver cited for following too closely.

OTHER PARTY:
  Name: Brian Walsh
  Insurance: GEICO
  Policy: 4532-11-2288
  Vehicle: 2021 Ford F-150

DAMAGE ESTIMATE:
  Rear Bumper Assembly           $1,850.00
  Trunk Lid (replace)            $2,400.00
  Tail Light Assembly (R)        $675.00
  Tail Light Assembly (L)        $675.00
  Exhaust System Repair          $890.00
  Paint & Body Labor             $1,650.00
  Frame Alignment Check          $350.00
  Rental Car (Est. 7 days)       $455.00
  
TOTAL ESTIMATED DAMAGE: $8,945.00
DEDUCTIBLE: $500.00
NET CLAIM: $8,445.00

Adjuster Assigned: Thomas Bradley
Adjuster Phone: (309) 555-0876`
  },
  {
    name: 'pa_homeowners_claim.txt',
    type: 'text/plain',
    category: 'fnol_form',
    content: `ERIE INSURANCE GROUP
HOMEOWNER'S CLAIM - FIRST NOTICE OF LOSS
100 Erie Insurance Place, Erie, PA 16530

Claim #: ERIE-HO-2026-01456
Policy #: HO3-PA-2025-778899
Date of Loss: 01/10/2026
Date Reported: 01/11/2026

INSURED:
  Name: Thomas and Maria Kowalski
  Property: 234 Maple Avenue, Pittsburgh, PA 15213
  Phone: (412) 555-0234
  
COVERAGE:
  Dwelling (A): $385,000
  Personal Property (C): $192,500
  Loss of Use (D): $77,000
  Liability (E): $300,000
  Deductible: $1,000

CAUSE OF LOSS: Burst pipe due to freezing temperatures
  
DESCRIPTION:
  On January 10, 2026, during a polar vortex event with temperatures
  reaching -15°F, a water supply pipe in the second-floor bathroom
  burst, causing significant water damage to the bathroom, hallway,
  and first-floor kitchen/dining area below.

DAMAGE ASSESSMENT:
  Category              Estimated Cost
  Emergency Mitigation  $3,500.00
  Bathroom Restoration  $12,800.00
  Hallway Repair        $4,200.00
  Kitchen Ceiling/Walls $8,600.00
  Flooring Replacement  $6,500.00
  Personal Property     $4,800.00
  Temporary Housing     $3,200.00

TOTAL ESTIMATED LOSS: $43,600.00
DEDUCTIBLE: $1,000.00
NET CLAIM AMOUNT: $42,600.00

Mitigation Company: ServiceMaster of Pittsburgh
  Contact: (412) 555-0789

Adjuster: Patricia Nowak
Date Inspected: 01/12/2026`
  },
  {
    name: 'az_ambulance_transport.txt',
    type: 'text/plain',
    category: 'medical_bill',
    content: `SOUTHWEST AMBULANCE SERVICE
4120 N 20th Street
Phoenix, AZ 85016
NPI: 8901234567 | Tax ID: 86-1234567

AMBULANCE TRANSPORT CLAIM
===========================
Run #: SWA-2026-00823
Date of Service: 01/08/2026

PATIENT:
  Name: Rosa Guadalupe Mendoza
  DOB: 12/03/1968
  Address: 3421 W Camelback Rd, Phoenix, AZ 85017
  Insurance: AHCCCS (Arizona Medicaid)
  Member ID: AHCCCS-A23456789
  
TRANSPORT DETAILS:
  Pick-up: 3421 W Camelback Rd, Phoenix, AZ 85017
  Destination: Banner University Medical Center
  Miles: 8.2
  Level of Service: ALS1 Emergency
  
CREW:
  Paramedic: John Estrada, NRP
  EMT: Sarah Wright, EMT-B

PROCEDURES:
HCPCS   Description                        Charge
A0427   ALS1 Emergency Transport           $1,850.00
A0425   Mileage (8.2 mi x $12/mi)         $98.40
99281   ED Assessment by Paramedic         $0.00 (incl.)

SUPPLIES:
  IV Start Kit                             $45.00
  Oxygen Administration                    $35.00
  Cardiac Monitor                          $75.00
  Medications Administered                 $120.00

CLINICAL NOTES:
  60 y/o female, chest pain, SOB. Vitals: BP 180/95,
  HR 110, SpO2 92% on RA. 12-lead: ST elevation V1-V4.
  STEMI alert called. IV access x1, NTG x3, ASA 324mg.

DIAGNOSIS:
  I21.09 - Acute STEMI, unspecified site
  R06.02 - Shortness of breath
  I10 - Essential hypertension

TOTAL CHARGES: $2,223.40
AHCCCS Allowed: $1,250.00`
  },
  {
    name: 'mn_lab_work_claim.txt',
    type: 'text/plain',
    category: 'medical_bill',
    content: `QUEST DIAGNOSTICS - MINNEAPOLIS
2655 Hennepin Avenue South
Minneapolis, MN 55408
NPI: 0123456789 | CLIA: 24D0404532

LABORATORY CLAIM
==================
Requisition #: QD-MN-2026-554312
Collection Date: 01/16/2026
Report Date: 01/18/2026

PATIENT:
  Name: Eric Johansson
  DOB: 05/21/1970
  Gender: Male
  Insurance: HealthPartners
  Member ID: HP-MN-443256
  Policy #: HPP-2025-GROUP-882
  Ordering Provider: Dr. Anne Lindberg, MD (NPI: 2345678901)

TESTS ORDERED AND RESULTS:
CPT     Test                              Result      Ref Range       Flag
80053   Comprehensive Metabolic Panel     --          --              --
        Glucose                           142 mg/dL   70-100          HIGH
        BUN                               28 mg/dL    7-20            HIGH
        Creatinine                        1.4 mg/dL   0.7-1.3         HIGH
        eGFR                              52          >60             LOW
        Sodium                            139         136-145
        Potassium                         4.8         3.5-5.0
        CO2                               24          23-29
        Calcium                           9.2         8.5-10.5
83036   Hemoglobin A1C                    7.8%        <5.7%           HIGH
80061   Lipid Panel                       --          --              --
        Total Cholesterol                 245 mg/dL   <200            HIGH
        LDL                               162 mg/dL   <100            HIGH
        HDL                               38 mg/dL    >40             LOW
        Triglycerides                     225 mg/dL   <150            HIGH
84443   TSH                               2.45        0.27-4.20
85025   CBC w/ Differential               WNL         --

DIAGNOSES:
  E11.65 - Type 2 diabetes with hyperglycemia
  E78.5 - Hyperlipidemia, unspecified
  N18.3 - Chronic kidney disease, stage 3

CHARGES:
  80053 Comprehensive Metabolic Panel     $185.00
  83036 Hemoglobin A1C                    $65.00
  80061 Lipid Panel                       $95.00
  84443 TSH                               $75.00
  85025 CBC w/ Diff                       $45.00

TOTAL CHARGES: $465.00
Contracted Rate: $215.00
Patient Copay: $25.00`
  },
  {
    name: 'co_ski_injury_er_claim.txt',
    type: 'text/plain',
    category: 'medical_bill',
    content: `VAIL HEALTH HOSPITAL
181 West Meadow Drive
Vail, CO 81657
NPI: 3456789012 | Tax ID: 84-0567890

EMERGENCY DEPARTMENT CLAIM
============================
Account #: VH-2026-ED-007812
Date of Service: 01/11/2026

PATIENT:
  Name: Jonathan Blake Harrison
  DOB: 03/17/1995
  Address: 450 Park Avenue, New York, NY 10022
  Phone: (212) 555-0931
  Insurance: Cigna PPO
  Member ID: CGN-NY-776543
  Group #: GS-CORP-2025-112
  Employer: Goldman Sachs

EMERGENCY CONTACT: Laura Harrison (spouse) - (212) 555-0932

PRESENTING COMPLAINT: Ski accident at Vail Mountain, right knee injury

ATTENDING: Dr. Peter Millett, MD
Specialty: Sports Medicine / Orthopedic Surgery

SERVICES:
CPT     Description                              Charge
99284   ED Visit, High Severity                  $2,450.00
73721   MRI Right Knee w/o Contrast              $1,800.00
73560   X-Ray Right Knee, 2 Views                $385.00
29881   Knee Arthroscopy, Meniscectomy            $6,200.00
27428   Ligament Reconstruction, Knee             $12,500.00
29888   ACL Reconstruction w/ Autograft           $8,900.00
20610   Arthrocentesis, Major Joint               $475.00

DIAGNOSIS:
  S83.511A - Sprain of ACL of right knee, initial
  S83.211A - Bucket handle tear, medial meniscus, right knee
  M23.311 - Other meniscus derangement, right knee

ANESTHESIA: General, 2.5 hours

TOTAL CHARGES: $32,710.00
Estimated Insurance: $26,800.00
Out-of-Network Adjustment: TBD
Patient Estimated: $5,910.00

Follow-up: Dr. Millett's office, 01/25/2026`
  },
  {
    name: 'nc_home_health_claim.txt',
    type: 'text/plain',
    category: 'claim_invoice',
    content: `BAYADA HOME HEALTH CARE
CHARLOTTE REGION OFFICE
4801 E Independence Blvd, Suite 800
Charlotte, NC 28212
NPI: 4567890123 | Medicare Provider #: 34-8012

HOME HEALTH CLAIM - UB-04
============================
Claim #: BAYADA-NC-2026-005543
Billing Period: 12/01/2025 - 12/31/2025

PATIENT:
  Name: Dorothy Mae Patterson
  DOB: 04/09/1942
  Medicare ID: 2EJ7-HP4-QW89
  Secondary: Humana Gold Plus (HMO)
  Member ID: HGP-NC-112456
  Address: 1201 Providence Road, Charlotte, NC 28207
  
CERTIFICATION PERIOD: 11/15/2025 - 01/14/2026
REFERRING MD: Dr. Charles Newton, MD (NPI: 5678901234)

HOME HEALTH RESOURCE GROUP (HHRG): 3BFK2

SERVICES PROVIDED:
Revenue   HCPCS    Description                  Units    Charges
0551      G0151    PT Evaluation/Re-eval        1        $285.00
0421      G0151    PT Treatment Visit           8        $1,360.00
0551      G0152    OT Evaluation                1        $275.00
0431      G0152    OT Treatment Visit           4        $680.00
0551      G0299    Skilled Nursing Visit         12       $1,680.00
0571      G0493    RN Assessment Visit           2        $390.00
0581      G0156    HHA Services                  20       $1,400.00

DIAGNOSES (Primary): 
  I69.354 - Hemiplegia following cerebral infarction, left side
  I63.9 - Cerebral infarction, unspecified
  R26.89 - Other abnormalities of gait and mobility
  Z87.73 - Personal history of TIA/cerebral infarction

FUNCTIONAL STATUS:
  ADL Score: 12/24 (moderate dependence)
  Fall Risk: High
  OASIS Start of Care: 11/15/2025

TOTAL CHARGES: $6,070.00
MEDICARE PPS RATE: $4,225.00
HUMANA SECONDARY: $845.00
PATIENT: $0.00`
  },
  {
    name: 'va_vision_care_claim.txt',
    type: 'text/plain',
    category: 'medical_bill',
    content: `VIRGINIA EYE CONSULTANTS
241 Corporate Blvd
Norfolk, VA 23502
NPI: 5678901234 | Tax ID: 54-1234567

OPHTHALMOLOGY / VISION CARE CLAIM
====================================
Invoice #: VEC-2026-01234
Date of Service: 01/20/2026

PATIENT:
  Name: Catherine Anne Douglas
  DOB: 11/14/1958
  Insurance: Anthem Blue Cross (Medical)
  Member ID: ANT-VA-556677
  Vision Plan: VSP Choice
  VSP ID: VSP-441122

PROVIDER: Dr. Elizabeth Yeu, MD, FACS
Specialty: Cornea & Refractive Surgery
License: VA-MD-0101-12456

EXAMINATION:
CPT     Description                          Charge
92014   Ophthalmologic Exam, Estab, Compr    $295.00
92134   Scanning Computerized (OCT)          $125.00
92083   Visual Field Exam                    $175.00
76519   Ophthalmic Biometry (IOL Power)      $165.00

SURGICAL CONSULTATION (Scheduled 02/10/2026):
  66984   Cataract Surgery w/ IOL, Left Eye  $3,800.00 (est.)
  
DIAGNOSES:
  H25.11 - Age-related nuclear cataract, right eye
  H25.12 - Age-related nuclear cataract, left eye
  H40.10X0 - Open angle glaucoma, unspecified eye
  H52.4 - Presbyopia

VISION PLAN CHARGES (VSP):
  92004   Eye Exam                            $65.00
  V2020   Frame, Progressives                 $185.00
  V2781   Progressive Lenses                  $295.00

MEDICAL TOTAL: $760.00
VISION TOTAL: $545.00
COMBINED: $1,305.00

Medical Insurance Est. Pay: $580.00
VSP Allowance: $230.00
Patient Balance: $495.00`
  },
  {
    name: 'ct_dialysis_center_claim.csv',
    type: 'text/csv',
    category: 'medical_bill',
    content: `Facility,NPI,Address,Patient Name,DOB,Medicare ID,ESRD MBI,Insurance,Session Date,CPT Code,Modifier,Diagnosis,Revenue Code,Units,Charges,Allowed,Paid
DaVita Kidney Care #5512,6789012345,"200 Retreat Ave, Hartford, CT 06106",Frank Joseph Morelli,08/22/1965,3FG8-JK2-MN45,Yes,Medicare ESRD,01/02/2026,90937,--,N18.6,0821,1,$580.00,$285.00,$228.00
DaVita Kidney Care #5512,6789012345,"200 Retreat Ave, Hartford, CT 06106",Frank Joseph Morelli,08/22/1965,3FG8-JK2-MN45,Yes,Medicare ESRD,01/04/2026,90937,--,N18.6,0821,1,$580.00,$285.00,$228.00
DaVita Kidney Care #5512,6789012345,"200 Retreat Ave, Hartford, CT 06106",Frank Joseph Morelli,08/22/1965,3FG8-JK2-MN45,Yes,Medicare ESRD,01/07/2026,90937,--,N18.6,0821,1,$580.00,$285.00,$228.00
DaVita Kidney Care #5512,6789012345,"200 Retreat Ave, Hartford, CT 06106",Frank Joseph Morelli,08/22/1965,3FG8-JK2-MN45,Yes,Medicare ESRD,01/09/2026,90937,--,N18.6,0821,1,$580.00,$285.00,$228.00
DaVita Kidney Care #5512,6789012345,"200 Retreat Ave, Hartford, CT 06106",Frank Joseph Morelli,08/22/1965,3FG8-JK2-MN45,Yes,Medicare ESRD,01/11/2026,90937,--,N18.6,0821,1,$580.00,$285.00,$228.00
DaVita Kidney Care #5512,6789012345,"200 Retreat Ave, Hartford, CT 06106",Frank Joseph Morelli,08/22/1965,3FG8-JK2-MN45,Yes,Medicare ESRD,01/14/2026,90937,--,N18.6,0821,1,$580.00,$285.00,$228.00
DaVita Kidney Care #5512,6789012345,"200 Retreat Ave, Hartford, CT 06106",Frank Joseph Morelli,08/22/1965,3FG8-JK2-MN45,Yes,Medicare ESRD,01/16/2026,90940,--,"N18.6,E11.65",0821,1,$620.00,$310.00,$248.00
DaVita Kidney Care #5512,6789012345,"200 Retreat Ave, Hartford, CT 06106",Frank Joseph Morelli,08/22/1965,3FG8-JK2-MN45,Yes,Medicare ESRD,01/18/2026,90937,--,N18.6,0821,1,$580.00,$285.00,$228.00
DaVita Kidney Care #5512,6789012345,"200 Retreat Ave, Hartford, CT 06106",Frank Joseph Morelli,08/22/1965,3FG8-JK2-MN45,Yes,Medicare ESRD,01/21/2026,90937,--,N18.6,0821,1,$580.00,$285.00,$228.00
DaVita Kidney Care #5512,6789012345,"200 Retreat Ave, Hartford, CT 06106",Frank Joseph Morelli,08/22/1965,3FG8-JK2-MN45,Yes,Medicare ESRD,01/23/2026,90937,--,N18.6,0821,1,$580.00,$285.00,$228.00
DaVita Kidney Care #5512,6789012345,"200 Retreat Ave, Hartford, CT 06106",Frank Joseph Morelli,08/22/1965,3FG8-JK2-MN45,Yes,Medicare ESRD,01/25/2026,90940,--,"N18.6,E11.65",0821,1,$620.00,$310.00,$248.00
DaVita Kidney Care #5512,6789012345,"200 Retreat Ave, Hartford, CT 06106",Frank Joseph Morelli,08/22/1965,3FG8-JK2-MN45,Yes,Medicare ESRD,01/28/2026,90937,--,N18.6,0821,1,$580.00,$285.00,$228.00
DaVita Kidney Care #5512,6789012345,"200 Retreat Ave, Hartford, CT 06106",Frank Joseph Morelli,08/22/1965,3FG8-JK2-MN45,Yes,Medicare ESRD,01/30/2026,90937,--,N18.6,0821,1,$580.00,$285.00,$228.00`
  },
  {
    name: 'mi_dme_equipment_claim.txt',
    type: 'text/plain',
    category: 'claim_invoice',
    content: `NATIONAL SEATING & MOBILITY
DME SUPPLIER CLAIM
4600 East Paris Ave SE
Grand Rapids, MI 49512
NPI: 7890123456 | NSC Supplier #: 2340051

DURABLE MEDICAL EQUIPMENT CLAIM
==================================
Claim #: NSM-MI-2026-00234
Date of Service: 01/15/2026

PATIENT/BENEFICIARY:
  Name: Gerald Wayne Foster
  DOB: 10/05/1948
  Medicare ID: 4HJ9-KL3-PQ56
  Medicaid: MI-MA-2025-885567
  Address: 1205 Michigan Ave NE, Grand Rapids, MI 49503

REFERRING PHYSICIAN:
  Dr. James Wilson, MD
  NPI: 8901234567
  Specialty: Physical Medicine & Rehabilitation

MEDICAL NECESSITY: Patient is s/p CVA with left hemiparesis.
  Requires power wheelchair for community mobility.
  Unable to propel manual wheelchair independently.

EQUIPMENT ORDERED:
HCPCS    Description                          Qty   Charge
K0856    Power Wheelchair, Group 3            1     $6,800.00
E1028    Swing-away Joystick Mount            1     $425.00
E1014    Reclining Back w/ Headrest           1     $1,200.00
E2310    Power Seat Elevation                 1     $2,100.00
E2377    Expandable Contour Seat Cushion      1     $485.00
E2611    Custom Back Cushion                  1     $650.00
K0108    Wheelchair Component/Accessory       3     $375.00

CMN ON FILE: Yes (Certificate of Medical Necessity)
Prior Authorization: MI-PA-2026-00112

DIAGNOSES:
  I69.354 - Hemiplegia following cerebral infarction, left
  G81.94 - Hemiplegia, unspecified, affecting left side
  Z87.73 - History of TIA and cerebral infarction

TOTAL EQUIPMENT CHARGES: $12,035.00
Medicare Allowed (80%): $8,450.00
Medicaid Secondary (20%): $2,112.50
Patient Responsibility: $0.00`
  },
  {
    name: 'la_podiatry_claim.txt',
    type: 'text/plain',
    category: 'medical_bill',
    content: `CRESCENT CITY FOOT & ANKLE SPECIALISTS
1514 Jefferson Highway, Suite 300
New Orleans, LA 70121
Phone: (504) 555-0234
NPI: 9012345678 | Tax ID: 72-5678901

PODIATRY CLAIM / SUPERBILL
============================
Date of Service: 01/22/2026

PATIENT:
  Name: Deshawn Marcus Williams
  DOB: 07/08/1989
  Insurance: Blue Cross Blue Shield of Louisiana
  Member ID: BCBS-LA-334567
  Policy #: LA-PPO-2025-887
  Group: ENTERGY-2025

PROVIDER: Dr. Nicole Dupree, DPM, FACFAS
License #: LA-POD-3345

HISTORY: Patient is a 36 y/o male with Type 2 diabetes presenting
  with non-healing ulcer on right great toe, 3 weeks duration.

PROCEDURES:
CPT     Mod   Description                          Charge
99214   25    Office Visit, Estab, Moderate         $175.00
11042   RT    Debridement, Subcutaneous Tissue      $325.00
97597   RT    Debridement, Open Wound, 20 sq cm     $275.00
29580   RT    Strapping, Unna Boot                  $125.00
A6402   --    Sterile Gauze Pad (lg), Multi-Layer   $35.00
Q4131   --    Grafix Core Skin Substitute, sq cm    $850.00

DIAGNOSES:
  E11.621 - T2DM with foot ulcer
  L97.511 - Non-pressure chronic ulcer, right foot, skin breakdown
  E11.65 - T2DM with hyperglycemia
  I70.233 - Atherosclerosis of right leg w/ ulceration

DIABETIC SHOE PROGRAM (Future Order):
  A5500 x2 - Diabetic Shoes, Custom Molded         $425.00
  A5512 x6 - Multi-Density Insert                  $300.00

TOTAL TODAY: $1,785.00
SHOE PROGRAM: $725.00

Insurance Filing: Electronic
Referral Required: No (PPO)
Follow-up: 2 weeks`
  },
  {
    name: 'tn_substance_abuse_claim.txt',
    type: 'text/plain',
    category: 'claim_invoice',
    content: `CUMBERLAND HEIGHTS TREATMENT CENTER
8283 River Road Pike
Nashville, TN 37209
NPI: 0123456780 | License: TN-SA-2019-4453
CARF Accredited | Joint Commission Certified

SUBSTANCE ABUSE TREATMENT CLAIM
==================================
Admission #: CH-2026-00156
Patient Account: 2026-TN-884

PATIENT:
  Name: Ryan Christopher Adams
  DOB: 11/25/1991
  Insurance: Anthem Blue Cross Blue Shield of TN
  Member ID: ANT-TN-778899
  Policy #: ANTHN-2025-EAP-443
  Employer: FedEx Corporation
  EAP Authorization: Yes (30 days inpatient)

ADMISSION: 12/28/2025
DISCHARGE: 01/25/2026 (28 days)
LEVEL OF CARE: ASAM 3.5 - Clinically Managed High-Intensity Residential

SERVICES:
Revenue   CPT/HCPCS  Description                    Days/Units  Per Diem    Total
0100      --         Room & Board, Residential      28          $850.00     $23,800.00
0914      H0004      Individual Therapy             12          $175.00     $2,100.00
0915      H0005      Group Therapy                  25          $85.00      $2,125.00
0916      90847      Family Therapy                 4           $275.00     $1,100.00
0918      H0049      Alcohol/Drug Screening         8           $45.00      $360.00
0250      --         Pharmacy (Vivitrol, etc.)       --          --          $2,800.00
0300      --         Laboratory                     --          --          $650.00
0942      H0015      Intensive Outpatient (IOP)     0           $0.00       $0.00

DIAGNOSES:
  F10.20 - Alcohol dependence, uncomplicated
  F14.20 - Cocaine dependence, uncomplicated
  F33.1 - Major depressive disorder, recurrent, moderate
  F41.1 - Generalized anxiety disorder

TOTAL CHARGES: $32,935.00
INSURANCE AUTHORIZED: $28,000.00
EAP SUPPLEMENTAL: $3,200.00
PATIENT RESPONSIBILITY: $1,735.00

AFTERCARE PLAN: 90 meetings in 90 days, weekly IOP x 12 weeks
DISCHARGE STATUS: Improved, medically stable

Clinician: Dr. Amanda Foster, MD, FASAM`
  },
  {
    name: 'md_radiology_report_claim.txt',
    type: 'text/plain',
    category: 'medical_bill',
    content: `JOHNS HOPKINS RADIOLOGY
600 N Wolfe Street, Phipps Building
Baltimore, MD 21287
NPI: 1234567891 | Tax ID: 52-0595110

RADIOLOGY / IMAGING SERVICES CLAIM
=====================================
Accession #: JH-RAD-2026-045678
Date of Exam: 01/17/2026

PATIENT:
  Name: Sandra Lee Washington
  DOB: 06/30/1973
  MRN: JH-2234567
  Insurance: CareFirst BCBS
  Member ID: CF-MD-998877
  Policy #: FED-BCBS-2025-PPO
  Employer: Federal Government (OPM)

ORDERING PHYSICIAN: Dr. Katherine Berman, MD
  Specialty: Oncology
  NPI: 2345678912

EXAMINATIONS:
CPT     Modifier  Description                              Charge
77067   --        Screening Mammogram, Bilateral, 3D       $450.00
77065   --        Diagnostic Mammogram, Right Breast       $375.00
76641   --        US Breast, Complete, Right                $425.00
77021   --        MR Guidance for Needle Placement          $650.00
19083   --        Breast Biopsy w/ MR Guidance, Right       $2,800.00

FINDINGS SUMMARY:
  BI-RADS 4B suspicious abnormality identified in right breast,
  2 o'clock position, 6cm from nipple. 1.2cm irregular mass
  with associated microcalcifications. Core needle biopsy performed.
  
  Pathology pending (expected 01/22/2026).

DIAGNOSES:
  R92.1 - Calcification of breast
  N63.10 - Unspecified lump in right breast
  Z12.31 - Encounter for screening mammogram
  Z80.3 - Family history of malignant neoplasm of breast

TOTAL PROFESSIONAL FEES: $4,700.00
TECHNICAL FACILITY FEES: $3,200.00
COMBINED TOTAL: $7,900.00
Insurance Est.: $6,100.00
Patient Est.: $1,800.00

STAT PATHOLOGY REQUESTED: Yes
Results will be sent to ordering physician.`
  },
  {
    name: 'or_naturopathic_claim.txt',
    type: 'text/plain',
    category: 'medical_bill',
    content: `PORTLAND NATURAL HEALTH CENTER
2045 NW Lovejoy Street
Portland, OR 97209
Phone: (503) 555-0789
NPI: 3456789013 | Tax ID: 93-2345678

NATUROPATHIC MEDICINE CLAIM
==============================
Claim Date: 01/21/2026

PATIENT:
  Name: Sarah Jane Morrison-Chen
  DOB: 02/14/1984
  Insurance: Providence Health Plan
  Member ID: PVD-OR-223344
  Policy #: PVD-NAT-2025-PPO
  
PROVIDER: Dr. Emily Nakamura, ND, LAc
License #: OR-ND-1245 | OR-LAC-5567
Specialty: Naturopathic Family Medicine, Acupuncture

OFFICE VISIT:
CPT     Description                              Charge
99214   Office Visit, Estab, Moderate             $175.00
97810   Acupuncture, 1+ Needles, w/o E-Stim      $95.00
97811   Acupuncture, Addtl 15 min                 $65.00
96372   Therapeutic IM Injection                   $45.00
J3420   Vitamin B12 Injection, up to 1000 mcg     $25.00

LAB WORK (sent to LabCorp):
CPT     Description                              Charge
84439   Free Thyroxine (Free T4)                  $65.00
84443   TSH                                       $55.00
82306   Vitamin D, 25-Hydroxy                     $95.00
82728   Ferritin                                  $55.00
83655   Lead Level, Blood                         $65.00

DIAGNOSES:
  E03.9 - Hypothyroidism, unspecified
  D50.9 - Iron deficiency anemia, unspecified
  G43.909 - Migraine, unspecified, not intractable
  M79.1 - Myalgia

SUPPLEMENTS DISPENSED (not billed to insurance):
  Thyroid Support Formula 60ct                    $42.00
  Iron Bisglycinate 30mg 90ct                     $28.00
  Magnesium Glycinate 400mg 120ct                 $35.00

TOTAL MEDICAL CHARGES: $740.00
SUPPLEMENTS (self-pay): $105.00
Insurance Copay: $35.00
Est. Insurance Payment: $520.00
Patient Balance: $185.00`
  },
  {
    name: 'nv_plastic_surgery_cosmetic.txt',
    type: 'text/plain',
    category: 'claim_invoice',
    content: `LAS VEGAS PLASTIC SURGERY INSTITUTE
3025 S Maryland Pkwy, Suite 200
Las Vegas, NV 89109
NPI: 4567890124 | Tax ID: 88-3456789

PLASTIC SURGERY CLAIM / SELF-PAY AGREEMENT
=============================================
Case #: LVPSI-2026-00089
Date of Surgery: 01/14/2026

PATIENT:
  Name: Melissa Anne Thornton
  DOB: 09/03/1980
  Address: 2890 Paradise Rd, Unit 1504, Las Vegas, NV 89109
  Phone: (702) 555-0456
  Insurance: Anthem BCBS (medical portion only)
  Member ID: ANT-NV-445566

SURGEON: Dr. Christopher Khorsandi, MD, FACS
Board Certified: American Board of Plastic Surgery
License #: NV-MD-9934

PROCEDURES:
CPT     Description                            Insurance    Self-Pay
15830   Panniculectomy (medically necessary)   $8,500.00    --
15847   Abdominoplasty (cosmetic portion)      --           $6,500.00
15877   Suction Lipectomy, Trunk               --           $4,200.00
00400   Anesthesia                             $2,800.00    $1,200.00

MEDICAL JUSTIFICATION (Insurance):
  Panniculectomy: Chronic intertrigo, recurrent skin infections,
  functional limitation. BMI decreased from 42 to 28 after
  bariatric surgery (gastric sleeve 03/2024). Excess skin = 4.2 kg.

DIAGNOSES:
  L30.4 - Erythema intertrigo
  L08.1 - Erythrasma
  E66.01 - Morbid obesity due to excess calories (history)
  Z98.84 - Bariatric surgery status

FACILITY FEE: $5,500.00

SUMMARY:
  Total Medical (Insurance):     $11,300.00
  Total Cosmetic (Self-Pay):     $11,900.00
  Facility Fee (Split 50/50):    $5,500.00
  GRAND TOTAL:                   $28,700.00
  
  Insurance Estimate:            $9,040.00
  Patient Self-Pay:              $19,660.00
  
  Financing: CareCredit approved, 24 months @ 0% APR

Surgeon Signature: Dr. Christopher Khorsandi, MD, FACS`
  },
  {
    name: 'wi_occupational_therapy.txt',
    type: 'text/plain',
    category: 'medical_bill',
    content: `FROEDTERT & MCW REHABILITATION SERVICES
9200 W Wisconsin Ave
Milwaukee, WI 53226
NPI: 5678901235 | Tax ID: 39-4567890

OCCUPATIONAL THERAPY CLAIM
============================
Account #: FR-OT-2026-11234
Billing Period: 01/06/2026 - 01/31/2026

PATIENT:
  Name: Patricia Ann Nowicki
  DOB: 12/20/1968
  Insurance: Quartz Health Solutions
  Member ID: QTZ-WI-667788
  Auth #: QTZ-OT-2026-00234 (20 visits authorized)
  Referral: Dr. Mark Steffen, MD (Hand Surgery)

THERAPIST: Jessica Bauer, OTR/L, CHT
  License #: WI-OT-8876
  Specialty: Certified Hand Therapist

DIAGNOSIS:
  S62.001A - Fracture of navicular (scaphoid) bone, right wrist
  M24.541 - Contracture, right hand
  Post-op: ORIF right scaphoid (12/15/2025)

TREATMENT LOG:
Date        CPT     Units  Description                    Charge
01/06/2026  97530   2      Therapeutic Activities, 30min   $150.00
01/06/2026  97110   2      Therapeutic Exercise, 30min     $130.00
01/06/2026  97140   1      Manual Therapy, 15min           $75.00
01/08/2026  97530   2      Therapeutic Activities           $150.00
01/08/2026  97542   1      Wheelchair Mgmt Training         $85.00
01/10/2026  97110   2      Therapeutic Exercise             $130.00
01/10/2026  97760   1      Orthotics Mgmt/Training          $95.00
01/13/2026  97530   2      Therapeutic Activities           $150.00
01/13/2026  97110   2      Therapeutic Exercise             $130.00
01/15/2026  97530   2      Therapeutic Activities           $150.00
01/15/2026  97140   1      Manual Therapy                   $75.00
01/17/2026  97110   2      Therapeutic Exercise             $130.00
01/17/2026  97542   1      Wheelchair Mgmt Training         $85.00

VISITS: 6 of 20 authorized
TOTAL CHARGES: $1,535.00
Copay ($30/visit x 6): $180.00
Insurance Est.: $1,180.00
Patient Balance: $175.00

PROGRESS: ROM improved from 35° to 55° wrist flexion.
Grip strength 18 lbs (goal: 45 lbs). Progressing well.`
  },
  {
    name: 'ny_medicaid_pediatric_claim.txt',
    type: 'text/plain',
    category: 'medical_bill',
    content: `CHILDREN'S HOSPITAL AT MONTEFIORE (CHAM)
3415 Bainbridge Avenue
Bronx, NY 10467
NPI: 6789012346 | Medicaid Provider: NY-MC-0012345

MEDICAID MANAGED CARE CLAIM
==============================
Claim #: CHAM-2026-PED-04567
Date of Service: 01/14/2026

PATIENT:
  Name: Aaliyah Grace Johnson
  DOB: 06/22/2019 (Age 6)
  Medicaid CIN: AB12345C
  Managed Care Plan: Healthfirst (Medicaid)
  Plan ID: HF-MC-NY-445566
  PCP: Dr. Rashida Owens, MD (Pediatrics)

PARENT/GUARDIAN:
  Name: Keisha Denise Johnson
  Phone: (718) 555-0345
  Address: 2350 Grand Concourse, Apt 5F, Bronx, NY 10458

ENCOUNTER TYPE: Well-Child Visit + Sick Visit

SERVICES:
CPT     Mod   Description                        Charge    Medicaid Fee
99393   --    Well-Child Visit (3-8 yrs)          $245.00   $124.00
90460   --    Immunization Admin, 1st             $35.00    $18.50
90461   --    Immunization Admin, Addtl           $25.00    $12.00
90707   --    MMR Vaccine                         $85.00    VFC
90716   --    Varicella Vaccine                   $145.00   VFC
96110   --    Developmental Screening             $25.00    $15.00
99213   25    Sick Visit - Ear Pain (separate)    $145.00   $78.00
69210   --    Cerumen Removal                     $85.00    $42.00

DIAGNOSES:
  Z00.121 - Well child exam with abnormal findings
  H66.91 - Otitis media, unspecified, right ear
  Z23 - Encounter for immunization

REFERRAL GENERATED:
  Audiology evaluation (pending recurrent OM)

TOTAL CHARGES: $790.00
MEDICAID ALLOWED: $289.50
VFC VACCINES: No charge
PATIENT COPAY: $0.00

EPSDT Screen: Complete
Lead Level: 1.2 mcg/dL (normal)
BMI: 50th percentile (normal)
Vision: 20/25 bilateral (pass)`
  },
  {
    name: 'multi_state_tpa_batch_claims.csv',
    type: 'text/csv',
    category: 'claim_invoice',
    content: `TPA_Name,Claim_Number,State,Claimant,DOB,Policy_Number,Carrier,Date_of_Loss,Claim_Type,CPT_Codes,ICD10_Codes,Provider,Total_Billed,Allowed_Amount,Status,Adjuster
Sedgwick Claims Management,SCM-2026-NY-001,NY,Anthony Russo,03/15/1979,WC-NY-2025-112233,Hartford,12/20/2025,Workers Comp,"99213,97110,97140","M54.5,S39.012A",NY Spine & Wellness,$2450.00,$1890.00,Under Review,Jane Cooper
Sedgwick Claims Management,SCM-2026-FL-002,FL,Maria Santos,08/22/1985,GL-FL-2025-445566,Zurich,01/02/2026,General Liability,"99283,73610,29515","S82.001A,W01.XXXA",Baptist Hospital Miami,$4875.00,$3200.00,Pending,Mike Brown
Gallagher Bassett Services,GBS-2026-TX-003,TX,Billy Ray Johnson,11/30/1972,AL-TX-2025-778899,Travelers,01/05/2026,Auto Liability,"99284,72141,72148","S13.4XXA,S33.5XXA",Texas Spine Center,$8920.00,$6100.00,Approved,Sarah Lee
Gallagher Bassett Services,GBS-2026-CA-004,CA,Lisa Chang-Wu,04/18/1990,PL-CA-2025-990011,CNA Financial,12/15/2025,Product Liability,"99214,20610,73721","M75.110,S43.401A",Cedars-Sinai,$5340.00,$4200.00,Denied - Resubmit,Tom Wilson
Crawford & Company,CRW-2026-IL-005,IL,Patrick O'Malley,02/28/1965,WC-IL-2025-223344,Liberty Mutual,01/08/2026,Workers Comp,"99233,27447,97530","M17.11,Z96.641",Rush University Medical,$34500.00,$28000.00,Under Review,Pat Kim
Crawford & Company,CRW-2026-NJ-006,NJ,Fatima Al-Rashid,07/12/1988,PIP-NJ-2025-556677,Plymouth Rock,12/28/2025,PIP/Auto,"99283,97110,97140","M54.2,S13.4XXA",Atlantic Health,$6780.00,$5100.00,Approved,Alex Reyes
Broadspire Services,BSI-2026-GA-007,GA,Terrell Washington,09/05/1995,WC-GA-2025-889900,Berkshire Hathaway,01/10/2026,Workers Comp,"99284,27752,73592","S82.101A,W17.XXXA",Grady Memorial Hospital,$12450.00,$9800.00,Pending Medical Records,Chris Park
Broadspire Services,BSI-2026-PA-008,PA,Anna Kowalski-Miller,01/20/1978,HO-PA-2025-112244,Erie Insurance,01/03/2026,Property - Homeowners,--,"--",ServiceMaster Restore,$18900.00,$16500.00,Field Inspection Scheduled,Lisa Chen`
  },
  {
    name: 'sc_urgent_care_walk_in.txt',
    type: 'text/plain',
    category: 'medical_bill',
    content: `DOCTORS CARE
A Division of UCI Medical Affiliates
2701 Devine Street
Columbia, SC 29205
NPI: 7890123457 | Tax ID: 57-0678901

URGENT CARE / WALK-IN CLINIC CLAIM
=====================================
Encounter #: DC-SC-2026-009234
Date: 01/19/2026

PATIENT:
  Name: Taylor Madison Brooks
  DOB: 01/05/2001
  Student ID: USC-2023-445566
  Insurance: Parents' Plan - BCBS of South Carolina
  Member ID: BCBS-SC-112233
  Subscriber: James Brooks (Father)
  Relationship: Dependent

PRESENTING: 24 y/o female, University of South Carolina student.
  CC: Severe sore throat x3 days, fever 101.8°F, difficulty swallowing.

VITALS:
  Temp: 101.8°F | HR: 92 | BP: 118/74 | SpO2: 99%

SERVICES:
CPT     Description                          Charge
99213   Office Visit, Estab, Low-Moderate     $165.00
87880   Rapid Strep Test                      $38.00
87081   Culture, Bacterial, Screen            $55.00
87635   COVID-19 PCR Test                     $85.00
87804   Influenza A/B Rapid Test              $42.00
96372   IM Injection Administration           $65.00
J0696   Ceftriaxone 250mg Injection           $32.00

RESULTS:
  Rapid Strep: POSITIVE
  Influenza: Negative
  COVID-19: Pending (24-48 hrs)

DIAGNOSIS:
  J02.0 - Streptococcal pharyngitis
  R50.9 - Fever, unspecified

TREATMENT:
  Ceftriaxone 250mg IM x1 (in office)
  Rx: Amoxicillin 500mg TID x 10 days
  Return if not improving in 48-72 hours

TOTAL CHARGES: $482.00
Copay Collected: $45.00
Balance to Insurance: $437.00

Provider: Dr. Amanda Foster, PA-C
Supervising: Dr. Keith Robinson, MD`
  },
  {
    name: 'ks_veterinary_pet_insurance.txt',
    type: 'text/plain',
    category: 'claim_invoice',
    content: `BLUE PEARL SPECIALTY + EMERGENCY PET HOSPITAL
11950 W 110th Street
Overland Park, KS 66210
Phone: (913) 555-0456

PET INSURANCE CLAIM
======================
Claim #: BP-KS-2026-002345
Date of Service: 01/16/2026

PET OWNER:
  Name: Rachel and David Goldstein
  Address: 7845 Metcalf Ave, Overland Park, KS 66204
  Phone: (913) 555-0123
  Insurance: Nationwide Pet Insurance
  Policy #: NW-PET-2025-887766
  
PET INFORMATION:
  Name: Winston
  Species: Canine
  Breed: English Bulldog
  Age: 4 years
  Weight: 52 lbs
  Microchip: 985112345678901

PRESENTING: Emergency visit. Owner reports acute onset of 
  labored breathing, cyanotic gums. Suspect brachycephalic
  obstructive airway syndrome (BOAS) acute episode.

ATTENDING: Dr. Sarah Kim, DVM, DACVS

SERVICES:
Code    Description                          Charge
--      Emergency Exam Fee                   $185.00
--      Thoracic Radiographs (3 views)       $325.00
--      Blood Gas Analysis (ABG)             $175.00
--      CBC/Chemistry Panel                  $245.00
--      IV Catheter Placement & Fluids       $285.00
--      Oxygen Supplementation (6 hrs)       $420.00
--      Sedation (Butorphanol/Acepromazine)  $125.00
--      Soft Palate Resection Surgery        $3,200.00
--      Stenotic Nares Correction            $1,800.00
--      General Anesthesia                   $650.00
--      Post-Op Monitoring (24 hrs)          $480.00
--      Medications (Carprofen, Antibiotics) $165.00
--      E-collar                             $25.00

DIAGNOSIS:
  Brachycephalic Obstructive Airway Syndrome (BOAS)
  Elongated Soft Palate
  Stenotic Nares
  Everted Laryngeal Saccules

TOTAL CHARGES: $8,080.00
Deductible (annual, met): $0.00
Reimbursement Rate: 80%
Estimated Reimbursement: $6,464.00
Owner Responsibility: $1,616.00

PROGNOSIS: Good with corrective surgery.
Follow-up: 10 days post-op recheck.`
  },
  {
    name: 'hi_travel_insurance_claim.txt',
    type: 'text/plain',
    category: 'fnol_form',
    content: `ALLIANZ GLOBAL ASSISTANCE
TRAVEL INSURANCE CLAIM FORM
9950 Mayland Drive, Richmond, VA 23233

Claim Number: ALZ-TRV-2026-007891
Policy Number: TRP-2025-US-443322
Date Filed: 01/24/2026

POLICYHOLDER / TRAVELER:
  Name: Samuel and Rachel Okonkwo
  Address: 1420 K Street NW, Washington, DC 20005
  Phone: (202) 555-0678
  Email: s.okonkwo@email.com

TRIP DETAILS:
  Destination: Maui, Hawaii
  Departure: 01/10/2026 (Washington Dulles - IAD)
  Return: 01/20/2026 (Kahului - OGG)
  Trip Cost: $8,450.00 (flights, resort, activities)
  Insurance Premium Paid: $425.00

COVERAGE: Travel Protector Plan
  Trip Cancellation: Up to $10,000
  Medical: Up to $50,000
  Emergency Evacuation: Up to $500,000
  Baggage: Up to $2,000

CLAIM TYPE: Medical + Trip Interruption

INCIDENT:
  Date: 01/14/2026
  Location: Haleakala National Park, Maui, HI
  
  While hiking Sliding Sands Trail, Mr. Okonkwo suffered
  severe dehydration and ankle sprain. Transported by
  park rangers to Maui Memorial Medical Center.

MEDICAL EXPENSES:
  Emergency Room Visit (99284)        $3,200.00
  X-Ray, Right Ankle (73610)          $385.00
  Cast Application (29405)            $475.00
  Medications                         $125.00
  Follow-up Visit (99213)             $195.00
  Medical Transport                   $650.00
  
  TOTAL MEDICAL: $5,030.00

TRIP INTERRUPTION:
  Unused Hotel (4 nights)             $1,800.00
  Change Fee (flights)                $400.00
  Cancelled Activities (snorkeling)   $350.00
  
  TOTAL TRIP INTERRUPTION: $2,550.00

GRAND TOTAL CLAIM: $7,580.00

DOCUMENTS ATTACHED:
  [X] Medical records and bills
  [X] Hotel cancellation confirmation
  [X] Airline change receipt
  [X] Activity cancellation
  [X] Ranger incident report

Claimant Signature: ____________________
Date: 01/24/2026`
  },
  {
    name: 'mo_nursing_home_ltc_claim.txt',
    type: 'text/plain',
    category: 'claim_invoice',
    content: `DELMAR GARDENS SKILLED NURSING FACILITY
14800 N Outer Forty Road
Chesterfield, MO 63017
NPI: 8901234568 | CMS Cert #: 265432
License: MO-SNF-2019-8812

LONG-TERM CARE / SNF CLAIM - UB-04
=====================================
Claim #: DG-MO-2026-002345
Billing Period: 01/01/2026 - 01/31/2026

RESIDENT:
  Name: Harold Eugene Schaefer
  DOB: 03/08/1938
  Medicare ID: 5KL2-MN7-OP89
  Medicaid: MO-MA-2025-776655
  LTC Insurance: Genworth Life
  Policy #: GLI-LTC-2018-334455
  
ADMISSION DATE: 09/15/2025
PAYER SEQUENCE: Medicare (days 21-100), Medicaid, LTC Insurance

ATTENDING: Dr. Robert Chen, MD (Geriatrics)
NPI: 9012345679

RUG-IV CLASSIFICATION: RUX (Ultra High Rehab + Extensive)

SERVICES - JANUARY 2026:
Revenue   Description                    Days   Per Diem    Total
0191      Subacute/SNF - Semi-Private    31     $425.00     $13,175.00
0420      Physical Therapy               --     --          $3,450.00
0430      Occupational Therapy           --     --          $2,800.00
0440      Speech Therapy                 --     --          $1,200.00
0250      Pharmacy                       --     --          $2,100.00
0260      IV Therapy                     --     --          $875.00
0270      Medical/Surgical Supplies      --     --          $450.00
0300      Laboratory                     --     --          $680.00
0350      CT Scan (Head)                 --     --          $1,200.00

CPT Codes: 97110, 97530, 97140, 97535, 92507, 92610
ICD-10: G30.9, F02.80, I10, E11.65, N39.0

DIAGNOSES:
  G30.9 - Alzheimer's disease, unspecified
  F02.80 - Dementia in other diseases, without behavioral disturbance
  I10 - Essential hypertension
  E11.65 - Type 2 diabetes with hyperglycemia
  N39.0 - Urinary tract infection
  Z74.01 - Bed confinement status

TOTAL CHARGES: $25,930.00
Medicare SNF (Days 87-100, coinsurance): $3,850.00
Medicaid: $8,200.00
LTC Insurance: $12,400.00
Patient Liability: $1,480.00

MDS Assessment: Quarterly review due 02/15/2026
Care Conference: Scheduled 02/01/2026`
  }
];

async function run() {
  console.log('='.repeat(70));
  console.log('  CLARIFYOPS DIVERSE CLAIMS PIPELINE TEST');
  console.log('  Testing 30 realistic claims from different sources');
  console.log('='.repeat(70));

  let token;
  try {
    token = await login();
    console.log('  Login successful!\n');
  } catch (err) {
    console.error('  LOGIN FAILED:', err.message);
    process.exit(1);
  }

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
    const num = String(i + 1).padStart(2, '0');
    process.stdout.write(`[${num}/${claims.length}] ${claim.name.padEnd(45)} `);

    const uploadResult = await uploadClaim(token, claim.name, claim.content, claim.type);

    if (!uploadResult.success) {
      console.log(`UPLOAD FAILED: ${uploadResult.error}`);
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

    results.uploaded++;
    process.stdout.write(`ID:${uploadResult.id} Type:${uploadResult.docType} `);

    const extractResult = await extractFields(token, uploadResult.id);

    if (!extractResult.success) {
      console.log(`EXTRACT FAILED: ${extractResult.error}`);
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
      console.log(`EXTRACTED ${fieldCount} fields`);
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

    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('\n' + '='.repeat(70));
  console.log('  TEST RESULTS SUMMARY');
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
      const entries = Array.isArray(d.fields) ? d.fields : Object.entries(d.fields);
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
  console.log('  TEST COMPLETE');
  console.log('='.repeat(70));

  const reportPath = path.join(__dirname, '..', 'test-results-diverse.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n  Full results saved to: ${reportPath}`);
}

run().catch(err => {
  console.error('Test script failed:', err);
  process.exit(1);
});
