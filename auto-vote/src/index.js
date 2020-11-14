const fetch = require("node-fetch");
const logger = new (require('./logger'))(__filename);
const states = require("../data/states.json");
const candidates = (process.env.APP_CANDIDATES && process.env.APP_CANDIDATES.split(",")) || ["JB", "DJT"];

const MIN = +process.env.AUTOVOTE_BULK_MIN || 20;
const MAX = +process.env.AUTOVOTE_BULK_MAX || 200;
const VOTE_API_ENDPOINT = "http://" + [process.env.VOTE_API_ENDPOINT, process.env.VOTE_PORT].join(":");

const votesFactory = () => {
  const votesCount = Math.floor(Math.random() * MAX) + MIN;
  const votes = [];

  for (let i = 0; i < votesCount; ++i) {
    let statesISO2 = Object.keys(states);
    let state = statesISO2[Math.floor(Math.random() * statesISO2.length)];
    let candidate = candidates[Math.floor(Math.random() * candidates.length)];
    votes.push({ state, candidate });
  }

  return votes;

};

const run = async () => {
  let votes = votesFactory();
  logger.debug('Generated', votes.length, 'fake votes using votesFactory');

  for (vote of votes) {
    await fetch([VOTE_API_ENDPOINT, 'vote'].join('/'), {
      method: 'POST',
      body: JSON.stringify(vote),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  let nextRun = Math.floor(Math.random() * 120) - 15;
  logger.debug('Running again in', nextRun, 'seconds');
  setTimeout(run, nextRun * 1000);
};

run();