const mysql = require("mysql");
require("dotenv").config();

// MySQL Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "123*/",
  database: process.env.DB_NAME || "avocado_hub",
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL database.");
  }
});

module.exports = db;
