const express = require("express");
const bodyParser = require("body-parser");
const logger = new (require("./logger"))(__filename);
const Queue = require("bee-queue");
const app = express();

const PORT = process.env.VOTE_PORT || 5000;

const states = require('../data/states.json');
const candidates = (process.env.APP_CANDIDATES && process.env.APP_CANDIDATES.split(",")) || ["JB", "DJT"];

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

const VoteQueue = new Queue('vote', {
  redis: {
    host: process.env.REDIS_HOST
  },
  removeOnSuccess: true
});

const isValidCandidate = (candidate) => {
  return candidates.includes(candidate);
};

const isValidState = (state) => {
  return states.hasOwnProperty(state);
};

app.post("/vote", (req, res) => {
  let vote = req.body;
  if (!vote.candidate || !vote.state) {
    logger.debug('Invalid vote payload', vote);
    return res.status(400).json({
      message: "Please provide candidate and state in order to vote."
    });
  }

  if (!isValidCandidate(vote.candidate)) {
    return res.status(400).json({
      message: "Invalid candidate selected",
      options: candidates,
    });
  }

  if (!isValidState(vote.state)) {
    return res.status(400).json({
      message: "Invalid state selected",
      options: Object.keys(states)
    });
  }

  VoteQueue.createJob(vote).save();
  logger.debug('Vote added to queue', vote);

  return res.json(vote);
});

app.listen(PORT, () => logger.notice("Express listening on port", PORT));