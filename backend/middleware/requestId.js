import { randomUUID } from 'crypto';

export default function requestIdMiddleware(req, res, next) {
  const requestId = req.headers['x-request-id'] || randomUUID();
  req.requestId = requestId;
  req.requestStartTime = Date.now();
  
  res.setHeader('X-Request-Id', requestId);
  
  res.on('finish', () => {
    const duration = Date.now() - req.requestStartTime;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${requestId}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    }
  });
  
  next();
}
