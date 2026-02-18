import express from 'express';
import multer from 'multer';
import path from 'path';
import pool from '../config/db.js';
import { authMiddleware, authorizeRoles } from '../controllers/userController.js';
import fileSizeLimit from '../middleware/fileSizeLimit.js';
import { uploadLimiter } from '../middleware/rateLimit.js';
import {
  uploadDocument,
  batchUploadDocuments,
  semanticSearch,
  extractDocument,
  extractClaimFields,
  saveCorrections,
  summarizeDocument,
  listDocuments,
  getDocument,
  getDocumentVersions,
  restoreDocumentVersion,
  uploadDocumentVersion,
  updateLifecycle,
  checkCompliance,
  getEntityTotals,
  searchDocuments,
  exportSummaryPDF,
  submitExtractionFeedback,
  getExtractionFeedback,
  addReviewNote,
  getReviewNotes,
  addComment,
  getComments,
  getReviewQueue,
  updateStatus,
  escalateClaim,
  handleClaimStatusWebhook,
  exportClaims,
  getClaimMetrics,
  getUploadHeatmap,
  getTopVendors,
  getCptExplainability,
  parseEdiHl7,
  ingestClaimIntegration,
  transcribeFnolAudio,
  purgeDemoDocuments,
  getClaimConfidence,
  getClaimDuplicates,
  resolveClaimDuplicate,
  getDuplicateOverview,
  generateChronology,
  getChronology,
} from '../controllers/claimController.js';
import { getAnomalyExplainability } from '../controllers/anomalyExplainController.js';
import { getClaimAuditTrail } from '../controllers/auditController.js';
import { processClaimWorkflow } from '../controllers/agenticClaimsController.js';
import { verifyClaimWebhookSignature } from '../middleware/claimWebhookAuth.js';

const router = express.Router();
const allowed = ['.pdf', '.docx', '.png', '.jpg', '.jpeg', '.txt', '.eml', '.csv'];
const upload = multer({
  dest: 'uploads/docs/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max, csv checked separately
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('Invalid file type'));
    }
    cb(null, true);
  }
});
const integrationUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExt = ['.edi', '.txt', '.hl7', '.x12'];
    if (!allowedExt.includes(ext)) {
      return cb(new Error('Invalid integration file type'));
    }
    cb(null, true);
  }
});
const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'audio/webm',
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'audio/x-m4a',
      'audio/ogg',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid audio file type'));
    }
    cb(null, true);
  }
});

router.post('/upload', uploadLimiter, authMiddleware, upload.single('file'), fileSizeLimit, uploadDocument);
router.post('/batch-upload', uploadLimiter, authMiddleware, upload.array('files', 50), batchUploadDocuments);
router.get('/semantic-search', authMiddleware, semanticSearch);
router.post('/status-webhook', verifyClaimWebhookSignature, handleClaimStatusWebhook);
router.post('/process', authMiddleware, processClaimWorkflow);
router.post('/fnol/transcribe', authMiddleware, audioUpload.single('audio'), transcribeFnolAudio);
router.get('/upload-heatmap', authMiddleware, getUploadHeatmap);
router.get('/top-vendors', authMiddleware, getTopVendors);
router.get('/', authMiddleware, listDocuments);
router.get('/totals-by-entity', authMiddleware, getEntityTotals);
router.get('/search', authMiddleware, searchDocuments);
router.get('/review-queue', authMiddleware, getReviewQueue);
router.get('/explain', authMiddleware, authorizeRoles('admin', 'internal_ops'), getAnomalyExplainability);
router.get('/duplicates/overview', authMiddleware, getDuplicateOverview);
router.get(
  '/metrics',
  authMiddleware,
  authorizeRoles('admin', 'internal_ops'),
  getClaimMetrics
);
router.get('/report/pdf', authMiddleware, exportSummaryPDF);
router.post('/export', authMiddleware, exportClaims);
router.post(
  '/escalate',
  authMiddleware,
  authorizeRoles('admin', 'internal_ops', 'adjuster'),
  escalateClaim
);
router.post('/edi-hl7/parse', authMiddleware, integrationUpload.single('file'), parseEdiHl7);
router.post('/ingest', authMiddleware, integrationUpload.single('file'), ingestClaimIntegration);
router.delete(
  '/purge-demo',
  authMiddleware,
  authorizeRoles('admin', 'internal_ops'),
  purgeDemoDocuments
);

router.post('/load-example', authMiddleware, async (req, res) => {
  try {
    const existing = await pool.query(
      "SELECT id FROM documents WHERE tenant_id = $1 AND metadata->>'is_demo' = 'true' LIMIT 1",
      [req.tenantId]
    );
    if (existing.rows.length > 0) {
      return res.json({ id: existing.rows[0].id, message: 'Example claim already loaded' });
    }

    const demoFields = {
      claim_number: 'CLM-2024-EX-001',
      policyholder_name: 'Sarah Mitchell',
      policy_number: 'POL-2024-847291',
      date_of_loss: '11/15/2024',
      loss_type: 'Motor Vehicle Accident',
      claimant_name: 'Sarah Mitchell',
      provider_name: 'Midwest Orthopedic Associates',
      estimated_value: '$12,450.00',
      icd_codes: 'M54.5 (Low back pain), S39.012A (Contusion of abdominal wall)',
      cpt_codes: '99213 (Office visit, est. patient, low complexity), 99214 (Office visit, est. patient, moderate complexity)',
      date_of_service: '11/16/2024 - 12/20/2024',
      diagnosis: 'Lumbar sprain following motor vehicle accident',
      treatment_summary: '3 office visits at Midwest Ortho. Initial ER visit for lumbar pain and abdominal tenderness. Follow-up with improvement noted. Cleared for normal activity 12/20/2024.',
      adjuster_assigned: 'Unassigned',
      status_notes: 'All CPT/ICD codes validated. No duplicate flags. Ready for adjuster review.'
    };

    const demoSummary = 'Casualty claim for lumbar sprain following MVA on 11/15/2024. Claimant Sarah Mitchell treated at Midwest Orthopedic Associates, 3 visits over 5 weeks. Total billed $12,450. CPT codes 99213 and 99214 validated against CMS database. ICD-10 codes M54.5 and S39.012A consistent with reported injuries. No duplicate claims found in system. No billing anomalies detected. Claim readiness: HIGH.';

    const rawText = `CLAIM FILE — CLM-2024-EX-001\n\nPolicy: POL-2024-847291\nClaimant: Sarah Mitchell\nDate of Loss: November 15, 2024\nType: Motor Vehicle Accident — Cook County, IL\n\nProvider: Midwest Orthopedic Associates\nDiagnosis: Lumbar sprain (M54.5), Abdominal contusion (S39.012A)\n\nVisit 1 — 11/16/2024: ER visit. Lumbar pain, abdominal tenderness. X-ray ordered. CPT 99213.\nVisit 2 — 11/22/2024: Office visit. Dx: lumbar sprain. PT recommended. CPT 99213.\nVisit 3 — 12/06/2024: Follow-up. Improvement noted. CPT 99213.\nVisit 4 — 12/20/2024: Final eval. Cleared for normal activity. CPT 99214.\n\nTotal Billed: $12,450.00\n\nAll codes validated. No duplicates detected.`;

    const { rows } = await pool.query(
      `INSERT INTO documents (tenant_id, file_name, doc_type, document_type, path, status, version, metadata, type, doc_title, file_type, raw_text, fields)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
      [
        req.tenantId,
        'Example_Claim_MVA_Mitchell.pdf',
        'claim_invoice',
        'claim_invoice',
        '',
        'processed',
        1,
        JSON.stringify({ is_demo: 'true' }),
        'claim_invoice',
        'CLM-2024-EX-001 — Mitchell MVA',
        'application/pdf',
        rawText,
        JSON.stringify(demoFields)
      ]
    );

    const docId = rows[0].id;

    const fieldEntries = Object.entries(demoFields).map(([key, value]) => ({
      field_name: key,
      field_value: value,
      confidence: key === 'adjuster_assigned' ? 0.5 : (0.88 + Math.random() * 0.11)
    }));

    await pool.query(
      `INSERT INTO claim_fields (document_id, fields, overall_confidence)
       VALUES ($1, $2, $3) ON CONFLICT (document_id) DO UPDATE SET fields = $2, overall_confidence = $3`,
      [docId, JSON.stringify(fieldEntries), 94.2]
    );

    await pool.query(
      `INSERT INTO claim_chronology (document_id, tenant_id, events, model_version, generated_at)
       VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT DO NOTHING`,
      [docId, req.tenantId, JSON.stringify([
        { date: '2024-11-15', event: 'Motor vehicle accident — Cook County, IL', type: 'Incident', source: 'FNOL Report' },
        { date: '2024-11-16', event: 'ER visit — lumbar pain, abdominal tenderness. X-ray ordered.', type: 'Emergency', source: 'Medical Records', cpt: '99213' },
        { date: '2024-11-22', event: 'Office visit — Midwest Ortho. Dx: lumbar sprain (M54.5). PT recommended.', type: 'Office Visit', source: 'Medical Records', cpt: '99213' },
        { date: '2024-12-06', event: 'Follow-up — improvement noted, continued PT.', type: 'Office Visit', source: 'Medical Records', cpt: '99213' },
        { date: '2024-12-20', event: 'Final evaluation — cleared for normal activity.', type: 'Office Visit', source: 'Medical Records', cpt: '99214' }
      ]), 'gpt-4o-mini']
    );

    res.json({ id: docId, message: 'Example claim loaded successfully' });
  } catch (err) {
    console.error('Load example claim error:', err);
    res.status(500).json({ message: 'Failed to load example claim' });
  }
});

router.get('/quick-stats', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
        COUNT(*) as total_claims,
        COUNT(*) FILTER (WHERE d.status = 'pending') as pending_claims,
        COUNT(*) FILTER (WHERE d.status = 'approved') as approved_claims,
        COUNT(*) FILTER (WHERE d.status = 'denied' OR d.status = 'rejected') as denied_claims,
        COUNT(*) FILTER (WHERE d.created_at >= NOW() - INTERVAL '30 days') as claims_this_month,
        ROUND(AVG(CASE WHEN cf.overall_confidence IS NOT NULL THEN cf.overall_confidence ELSE NULL END)::numeric, 1) as avg_confidence
      FROM documents d
      LEFT JOIN claim_fields cf ON cf.document_id = d.id
      WHERE d.tenant_id = $1`,
      [req.tenantId]
    );
    res.json(rows[0] || {});
  } catch (err) {
    console.error('Quick stats error:', err);
    res.status(500).json({ message: 'Failed to fetch quick stats' });
  }
});

router.get('/monthly-insights', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
        TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'denied' OR status = 'rejected') as denied
      FROM documents
      WHERE tenant_id = $1 AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
      LIMIT 12`,
      [req.tenantId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Monthly insights error:', err);
    res.status(500).json({ message: 'Failed to fetch monthly insights' });
  }
});

router.get('/vendor-scorecards', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
        COALESCE(d.fields->>'provider_name', d.fields->>'vendor', 'Unknown') as vendor_name,
        COUNT(*) as total_claims,
        COUNT(*) FILTER (WHERE d.status = 'approved') as approved,
        COUNT(*) FILTER (WHERE d.status = 'denied' OR d.status = 'rejected') as denied,
        ROUND(AVG(CASE WHEN cf.overall_confidence IS NOT NULL THEN cf.overall_confidence ELSE NULL END)::numeric, 1) as avg_confidence
      FROM documents d
      LEFT JOIN claim_fields cf ON cf.document_id = d.id
      WHERE d.tenant_id = $1
      GROUP BY COALESCE(d.fields->>'provider_name', d.fields->>'vendor', 'Unknown')
      ORDER BY total_claims DESC
      LIMIT 20`,
      [req.tenantId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Vendor scorecards error:', err);
    res.status(500).json({ message: 'Failed to fetch vendor scorecards' });
  }
});

router.get('/:id', authMiddleware, getDocument);
router.post('/:id/extract', authMiddleware, extractDocument);
router.post('/:id/extract-fields', authMiddleware, extractClaimFields);
router.post('/:id/corrections', authMiddleware, saveCorrections);
router.get('/:id/summary', authMiddleware, summarizeDocument);
router.get('/:id/versions', authMiddleware, getDocumentVersions);
router.post('/:id/versions/:versionId/restore', authMiddleware, restoreDocumentVersion);
router.post('/:id/version', uploadLimiter, authMiddleware, upload.single('file'), uploadDocumentVersion);
router.put('/:id/lifecycle', authMiddleware, updateLifecycle);
router.post('/:id/compliance', authMiddleware, checkCompliance);
router.patch('/:id/status', authMiddleware, authorizeRoles('admin', 'internal_ops', 'adjuster', 'viewer', 'broker'), updateStatus);
router.get('/:id/cpt-explain', authMiddleware, getCptExplainability);
router.get('/:id/audit', authMiddleware, authorizeRoles('admin', 'internal_ops', 'auditor'), getClaimAuditTrail);
router.get('/:id/confidence', authMiddleware, getClaimConfidence);
router.get('/:id/duplicates', authMiddleware, getClaimDuplicates);
router.post('/:id/duplicates/:flagId/resolve', authMiddleware, authorizeRoles('admin', 'internal_ops', 'adjuster', 'viewer', 'broker'), resolveClaimDuplicate);
router.get('/:id/feedback', authMiddleware, getExtractionFeedback);
router.post('/:id/feedback', authMiddleware, submitExtractionFeedback);
router.get('/:id/review-notes', authMiddleware, getReviewNotes);
router.post('/:id/review-notes', authMiddleware, authorizeRoles('admin', 'internal_ops', 'adjuster'), addReviewNote);
router.get('/:id/comments', authMiddleware, getComments);
router.post(
  '/:id/comments',
  authMiddleware,
  authorizeRoles('admin', 'internal_ops', 'adjuster'),
  addComment
);
router.post('/:id/chronology/generate', authMiddleware, generateChronology);
router.get('/:id/chronology', authMiddleware, getChronology);

export default router;
