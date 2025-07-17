const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ message: 'Server error' });
}

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Rejection');
});

process.on('uncaughtException', (err) => {
  logger.fatal(err, 'Uncaught Exception');
});

module.exports = errorHandler;
