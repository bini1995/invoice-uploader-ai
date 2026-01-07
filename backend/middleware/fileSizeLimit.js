
import path from 'path';
export default function fileSizeLimit(req, res, next) {
  if (!req.file) return next();
  const ext = path.extname(req.file.originalname).toLowerCase();
  const limit = ext === '.csv' ? 1 * 1024 * 1024 : 10 * 1024 * 1024; // 1MB for CSV, 10MB otherwise
  if (req.file.size > limit) {
    return res.status(413).json({ message: 'File too large' });
  }
  next();
}
