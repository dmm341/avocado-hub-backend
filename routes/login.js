const express = require("express");
const db = require("../config/db");
const router = express.Router();
/** ============================
 *  User Login
 * ============================ */
router.post("/", (req, res) => {
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
  module.exports = router;