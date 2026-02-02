import { randomUUID } from 'crypto';

export default function requestIdMiddleware(req, res, next) {
  const requestId = req.headers['x-request-id'] || randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  res.setHeader('X-Response-Time-Start', Date.now().toString());
  
  res.on('finish', () => {
    const duration = Date.now() - parseInt(res.getHeader('X-Response-Time-Start') || '0');
    res.setHeader('X-Response-Time', `${duration}ms`);
  });
  
  next();
}
