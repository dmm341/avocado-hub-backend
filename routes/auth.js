const express = require("express");
const db = require("../config/db");
const router = express.Router();

/** ============================
 *  User Registration
 * ============================ */
router.post("/", (req, res) => {
  const { username, email, password } = req.body;
  const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

  db.query(query, [username, email, password], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "User registered successfully!" });
  });
});

module.exports = router;
