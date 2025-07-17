const cron = require('node-cron');
const logger = require('./logger');

function schedule(name, pattern, task) {
  const job = cron.schedule(pattern, async () => {
    try {
      logger.info(`Cron job ${name} started`);
      await task();
      logger.info(`Cron job ${name} finished`);
    } catch (err) {
      logger.error({ err }, `Cron job ${name} failed`);
      if (task.retryCount === undefined) task.retryCount = 0;
      if (task.retryCount < 3) {
        task.retryCount += 1;
        logger.info(`Retrying job ${name} in 1 minute`);
        setTimeout(() => job.fireOnTick(), 60000);
      }
    }
  });
  return job;
}

module.exports = { schedule };
