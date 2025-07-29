const { createLogger, format, transports } = require('winston');
const path = require('path');

// Custom format for better readability
const customFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// Production format (JSON for log aggregation)
const productionFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? productionFormat : customFormat,
  transports: [
    // Console transport
    new transports.Console({
      format: process.env.NODE_ENV === 'production' 
        ? format.combine(format.colorize(), format.simple())
        : format.combine(format.colorize(), customFormat)
    }),
    
    // File transport for production
    ...(process.env.NODE_ENV === 'production' ? [
      new transports.File({ 
        filename: path.join(__dirname, '../logs/error.log'), 
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      new transports.File({ 
        filename: path.join(__dirname, '../logs/combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    ] : [])
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: process.env.NODE_ENV === 'production' ? [
    new transports.File({ 
      filename: path.join(__dirname, '../logs/exceptions.log') 
    })
  ] : [],
  
  // Handle unhandled rejections
  rejectionHandlers: process.env.NODE_ENV === 'production' ? [
    new transports.File({ 
      filename: path.join(__dirname, '../logs/rejections.log') 
    })
  ] : []
});

module.exports = logger;
