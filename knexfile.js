require("dotenv").config();

module.exports = {
  client: "mysql2",
  connection: {
    host: "127.0.0.1",
    port: "3306",
    database: "happiness",
    user: "root",
    password: "anhden11",
    ssl: {
      rejectUnauthorized: false,
    },
  },
};
