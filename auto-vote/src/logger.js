var path = require("path");
var chalk = require("chalk");
var production = process.env.APP_ENV === "production";

var logstamp = function (timestamp) {
  let tzoffset = new Date().getTimezoneOffset() * 60000; // in milliseconds
  let localISOTime = new Date(timestamp - tzoffset).toISOString();
  return localISOTime.slice(0, production ? -5 : -1).replace("T", " ");
};

console.error(
  chalk.bold(logstamp(Date.now())),
  "*",
  production ? chalk.green("PRODUCTION") : chalk.magenta("DEVELOPMENT"),
  "ENV * node",
  chalk.cyan(process.version),
  "initialized with pid",
  process.pid,
  "in",
  chalk.yellow(__dirname)
);

module.exports = function (filename, debugEnabled) {
  if (typeof debugEnabled !== "boolean") {
    debugEnabled = !production;
  }
  this.debugEnabled = (value) => {
    if (typeof value === "boolean") debugEnabled = value;
    else return debugEnabled;
  };

  var scriptName = path.basename(filename) + ":";

  var info = function (title, ...data) {
    console.log(
      chalk.yellow.bold("***"),
      logstamp(Date.now()),
      chalk.yellow.bold("INFO ") +
        chalk.yellow(debugEnabled ? scriptName : "*"),
      chalk.bold(title),
      ...data
    );
  };
  this.info = info;

  var notice = function (title, ...data) {
    console.error(
      chalk.green.bold("~~~"),
      logstamp(Date.now()),
      chalk.green.bold("\u2714"),
      chalk.yellow(scriptName),
      chalk.bold(title),
      ...data
    );
  };
  this.notice = notice;

  var debug = function (title, ...data) {
    console.error(
      chalk.bold("···"),
      logstamp(Date.now()),
      chalk.bold("DEBUG"),
      chalk.white(scriptName),
      chalk.cyan(title),
      ...data
    );
    return true;
  };
  this.debug = (...args) => (debugEnabled ? debug(...args) : false);

  var error = function (title, ...data) {
    console.error(
      chalk.red.inverse("==="),
      logstamp(Date.now()),
      chalk.red.bold("ERROR"),
      chalk.yellow(scriptName),
      chalk.bold(title),
      ...data
    );
  };
  this.error = error;

  var warning = function (title, ...data) {
    console.error(
      chalk.magenta.inverse("---"),
      logstamp(Date.now()),
      chalk.magenta.bold("WARNING"),
      chalk.yellow(scriptName),
      chalk.bold(title),
      ...data
    );
  };
  this.warning = warning;

  this.getNanoseconds = function () {
    let hrtime = process.hrtime();
    return hrtime[0] * 1000000000 + hrtime[1];
  };
  this.strDateTime = (timestamp) => logstamp(timestamp || Date.now());
};
