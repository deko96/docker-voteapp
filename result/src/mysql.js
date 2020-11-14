const mysql = require("mysql");
const logger = new (require("./logger"))(__filename);

const config = {
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_ROOT_PASSWORD || "root",
  database: process.env.MYSQL_DATABASE || "devapp-api",
};

const connection = mysql.createConnection(config);

connection.connect((err) => {
  if (err) return logger.error("Failed to establish database connection!", err);
  logger.notice(
    "Connected to",
    `${config.host}@${config.user}/${config.database}`
  );
});

module.exports = connection;