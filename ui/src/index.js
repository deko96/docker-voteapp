const path = require("path");
const fetch = require("node-fetch");
const express = require("express");
const cookieParser = require("cookie-parser");
const electoralCollege = require("./data/electoralCollege.json");

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const POLL_RATE_SECS = process.env.UI_POLL_RATE_SECS || 5000;
const RESULT_API_ENDPOINT = 'http://' + [
  process.env.RESULT_API_ENDPOINT,
  process.env.RESULT_PORT
].join(':');

const port = process.env.UI_PORT || 4444;

io.sockets.on("connection", function (socket) {
  socket.emit("message", { text: "Welcome!" });
});

getVotes();

async function getVotes() {
  try {
    const { updatedAt, candidates, states } = await fetch(
      RESULT_API_ENDPOINT
    ).then((r) => r.json());

    const results = {
      updatedAt,
      candidates,
      states,
      electoralCollege,
      electoralVotes: Object.keys(states).reduce(
        (acc, state) => {
          const jb = states[state].JB;
          const djt = states[state].DJT;
          const votes = electoralCollege[state];

          acc.JB += jb > djt ? votes : 0;
          acc.DJT += jb < djt ? votes : 0;

          return acc;
        },
        { JB: 0, DJT: 0 }
      ),
    };
    io.emit("results", results);
  } catch (err) {
    console.error(err);
  }

  setTimeout(() => getVotes(), POLL_RATE_SECS);
}

app.use(cookieParser());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});

app.use(express.static(__dirname + "/views"));

app.get("/", async (req, res) => {
  res.sendFile(path.resolve(__dirname + "/views/index.html"));
});

server.listen(port, () => {
  const port = server.address().port;
  console.log(`Server running on port ${port}`);
});
