
import logger from '../utils/logger.js';
function errorHandler(err, req, res, next) {
  // Log the error with context
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.userId
  });

  // Don't send error if headers already sent
  if (res.headersSent) return next(err);

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation error', 
      errors: err.errors 
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      message: 'Unauthorized access' 
    });
  }

  if (err.code === '23505') { // PostgreSQL unique constraint violation
    return res.status(409).json({ 
      message: 'Resource already exists' 
    });
  }

  if (err.code === '23503') { // PostgreSQL foreign key constraint violation
    return res.status(400).json({ 
      message: 'Invalid reference' 
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(statusCode).json({ 
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production, let the process continue
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Always exit for uncaught exceptions
  process.exit(1);
});

export default errorHandler;
