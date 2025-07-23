const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ message: 'Server error' });
}

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', err);
});

module.exports = errorHandler;
