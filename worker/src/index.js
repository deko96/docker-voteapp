const Queue = require("bee-queue");
const logger = new (require("./logger"))(__filename);
const mysql = require('./mysql');

const VoteQueue = new Queue("vote", {
  redis: {
    host: process.env.REDIS_HOST,
  },
  removeOnSuccess: true,
});

VoteQueue.process((job, done) => {
  const vote = job.data;

  mysql.query('INSERT INTO votes SET ?', vote, err => {
    if (err) {
      logger.error('Failed to insert vote into MySQL Database!', err);
      return done(err);
    }
    logger.notice('Vote added to MySQL Database', vote);
    done();
  });
});