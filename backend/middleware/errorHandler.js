import { ZodError } from 'zod';
import logger from '../utils/logger.js';
import buildProblemDetails from '../utils/problemDetails.js';

const formatZodErrors = (error) => error.errors.map((issue) => ({
  path: issue.path.join('.'),
  message: issue.message,
  code: issue.code
}));

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

  const instance = req.originalUrl;

  if (err instanceof ZodError) {
    const problem = buildProblemDetails({
      status: 400,
      title: 'Invalid request',
      detail: 'Request validation failed',
      instance,
      type: 'https://httpstatuses.com/400',
      errors: formatZodErrors(err)
    });
    return res.status(400).type('application/problem+json').json(problem);
  }

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    const problem = buildProblemDetails({
      status: 400,
      title: 'Validation error',
      detail: 'Request validation failed',
      instance,
      errors: err.errors || err.details || err.message
    });
    return res.status(400).type('application/problem+json').json(problem);
  }

  if (err.name === 'UnauthorizedError') {
    const problem = buildProblemDetails({
      status: 401,
      title: 'Unauthorized',
      detail: 'Unauthorized access',
      instance
    });
    return res.status(401).type('application/problem+json').json(problem);
  }

  if (err.code === '23505') { // PostgreSQL unique constraint violation
    const problem = buildProblemDetails({
      status: 409,
      title: 'Conflict',
      detail: 'Resource already exists',
      instance
    });
    return res.status(409).type('application/problem+json').json(problem);
  }

  if (err.code === '23503') { // PostgreSQL foreign key constraint violation
    const problem = buildProblemDetails({
      status: 400,
      title: 'Invalid reference',
      detail: 'Invalid reference',
      instance
    });
    return res.status(400).type('application/problem+json').json(problem);
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  const message = isProduction
    ? 'Internal server error'
    : err.message;

  const problem = buildProblemDetails({
    status: statusCode,
    title: statusCode === 500 ? 'Internal Server Error' : undefined,
    detail: message,
    instance,
    extra: !isProduction && err.stack ? { stack: err.stack } : undefined
  });

  res.status(statusCode).type('application/problem+json').json(problem);
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
