require("dotenv").config(); // Load environment variables
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors()); // Allow frontend to connect
app.use(express.json()); // Parse JSON request body

// MySQL Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,  // MySQL host (e.g., localhost)
  user: process.env.DB_USER,  // MySQL username
  password: process.env.DB_PASS,  // MySQL password
  database: process.env.DB_NAME,  // Database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database.");
  }
});

// API Route: User Registration
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  
  db.query(query, [username, email, password], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "User registered successfully!" });
  });
});

// API Route: User Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = ? AND password = ?";
  
  db.query(query, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) {
      res.json({ message: "Login successful", user: results[0] });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });
});
app.put("/farmers/:id", (req, res) => {
  const { id } = req.params;
  const { name, contact, location, avocado_type, total_fruits, total_money } = req.body;
  const query = "UPDATE farmers SET name=?, contact=?, location=?, avocado_type=?, total_fruits=?, total_money=? WHERE id=?";
  
  db.query(query, [name, contact, location, avocado_type, total_fruits, total_money, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Farmer updated successfully!" });
  });
});
// Get all farmers
app.get("/farmers", (req, res) => {
  const query = "SELECT * FROM farmers";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
// Add a new farmer
app.post("/farmers", (req, res) => {
  const { name, contact, location, avocado_type, total_fruits, total_money } = req.body;
  const query = "INSERT INTO farmers (name, contact, location, avocado_type, total_fruits, total_money) VALUES (?, ?, ?, ?, ?, ?)";

  db.query(query, [name, contact, location, avocado_type, total_fruits, total_money], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Farmer added successfully!" });
  });
});
// Delete a farmer by ID
app.delete("/farmers/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM farmers WHERE id = ?";

  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Farmer not found!" });
    }

    res.json({ message: "Farmer deleted successfully!" });
  });
});
//Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
