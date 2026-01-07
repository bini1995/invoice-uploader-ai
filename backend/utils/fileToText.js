
// Simple in-memory cache for OCR results (consider Redis for production)
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { fromPath } from 'pdf2pic';
import { createWorker } from 'tesseract.js';
import mammoth from 'mammoth';
import logger from './logger.js';
const ocrCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function normalize(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function getFileHash(filePath) {
  const stats = fs.statSync(filePath);
  return `${path.basename(filePath)}-${stats.size}-${stats.mtime.getTime()}`;
}

async function ocrImage(p) {
  const startTime = Date.now();
  try {
    const worker = await createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    const { data: { text } } = await worker.recognize(p);
    await worker.terminate();
    
    const duration = Date.now() - startTime;
    logger.info(`OCR completed in ${duration}ms for ${p}`);
    
    return normalize(text);
  } catch (error) {
    logger.error(`OCR failed for ${p}:`, error);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
}

async function extractPdf(filePath) {
  try {
    const data = await pdfParse(fs.readFileSync(filePath));
    let text = data.text.trim();
    
    if (text) {
      logger.info(`PDF text extraction successful for ${filePath}`);
      return text;
    }
    
    // Fallback to OCR for scanned PDFs
    logger.info(`PDF appears to be scanned, using OCR for ${filePath}`);
    const converter = fromPath(filePath, { 
      density: 200, 
      savePath: '/tmp', 
      format: 'png' 
    });
    
    text = '';
    for (let i = 1; i <= data.numpages; i++) {
      const page = await converter(i);
      text += await ocrImage(page.path);
      // Clean up temporary files
      if (fs.existsSync(page.path)) {
        fs.unlinkSync(page.path);
      }
    }
    
    return text;
  } catch (error) {
    logger.error(`PDF extraction failed for ${filePath}:`, error);
    throw new Error(`PDF processing failed: ${error.message}`);
  }
}

async function extractDocx(filePath) {
  try {
    const { value } = await mammoth.extractRawText({ path: filePath });
    logger.info(`DOCX extraction successful for ${filePath}`);
    return normalize(value);
  } catch (error) {
    logger.error(`DOCX extraction failed for ${filePath}:`, error);
    throw new Error(`DOCX processing failed: ${error.message}`);
  }
}

export default async function fileToText(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
}

  const ext = path.extname(filePath).toLowerCase();
  const fileHash = getFileHash(filePath);
  
  // Check cache for OCR results
  if (ocrCache.has(fileHash)) {
    const cached = ocrCache.get(fileHash);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      logger.info(`Using cached OCR result for ${filePath}`);
      return cached.text;
    } else {
      ocrCache.delete(fileHash);
    }
  }

  let text;
  const startTime = Date.now();

  try {
    if (ext === '.pdf') {
      text = await extractPdf(filePath);
    } else if (ext === '.docx') {
      text = await extractDocx(filePath);
    } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      text = await ocrImage(filePath);
      // Cache OCR results
      ocrCache.set(fileHash, {
        text,
        timestamp: Date.now()
      });
    } else {
      text = normalize(fs.readFileSync(filePath, 'utf8'));
    }

    const duration = Date.now() - startTime;
    logger.info(`File processing completed in ${duration}ms for ${filePath}`);
    
    return text;
  } catch (error) {
    logger.error(`File processing failed for ${filePath}:`, error);
    throw error;
  }
};
