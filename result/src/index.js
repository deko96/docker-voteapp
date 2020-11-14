const express = require("express");
const logger = new (require("./logger"))(__filename);
const app = express();
const mysql = require("./mysql");
const states = require("../data/states.json");

const PORT = process.env.RESULT_PORT || 5001;

const candidates = process.env.APP_CANDIDATES && process.env.APP_CANDIDATES.split(',') || ['JB', 'DJT'];

const isValidCandidate = (candidate) => {
  return candidates.includes(candidate);
};

const isValidState = (state) => {
  return states.hasOwnProperty(state);
};

app.get("/", (req, res) => {
  mysql.query(
    "SELECT * FROM votes",
    (err, rows) => {
      if (err) {
        logger.error("Failed to run SQL query", err);
        return res.send(500).json({
          message: err.sqlMessage,
        });
      }

      const initCandidates = candidates.reduce((a, b) => {
        return Object.assign(a, { [b]: 0 });
      }, {});

      const result = {
        candidates: initCandidates,
        states: Object.keys(states).reduce((a, b) => {
          return Object.assign(a, {
            [b]: { ...initCandidates },
          });
        }, {}),
        updatedAt: Date.now(),
      };

      rows.forEach(({ state, candidate }) => {
        if (!isValidCandidate(candidate)) {
          logger.warning('Candidate not found', candidate, 'Vote invalidated');
        } else {
          if (!isValidState(state)) {
            logger.warning('State not found', state, 'Vote invalidated');
          } else {
            result.states[state][candidate] += 1;
            result.candidates[candidate] += 1;
          }
        }
      });

      return res.send(result);
    }
  );
});

app.listen(PORT, () => logger.notice("Express listening on port", PORT));
