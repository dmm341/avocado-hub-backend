const express = require("express");
const db = require("../config/db");
const router = express.Router();

/** ============================
 *  GET ALL BUYERS
 * ============================ */
router.get("/", (req, res) => {
  const query = "SELECT * FROM buyers ORDER BY name ASC";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch buyers." });
    res.json(results);
  });
});

/** ============================
 *  ADD NEW BUYER
 * ============================ */
router.post("/", (req, res) => {
  const { name, contact, location } = req.body;

  if (!name || !contact || !location) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const query = "INSERT INTO buyers (name, contact, location) VALUES (?, ?, ?)";
  db.query(query, [name, contact, location], (err, result) => {
    if (err) {
      console.error("Error inserting buyer:", err);
      return res.status(500).json({ message: "Failed to add buyer." });
    }
    res.status(201).json({ message: "Buyer added successfully!", id: result.insertId });
  });
});

/** ============================
 *  UPDATE BUYER DETAILS
 * ============================ */
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, contact, location } = req.body;
  if (!name || !contact || !location) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const query = "UPDATE buyers SET name=?, contact=?, location=? WHERE id=?";
  db.query(query, [name, contact, location, id], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to update buyer." });
    res.json({ message: "Buyer updated successfully!" });
  });
});

/** ============================
 *  DELETE BUYER
 * ============================ */
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM buyers WHERE id = ?";

  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to delete buyer." });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Buyer not found!" });
    }
    res.json({ message: "Buyer deleted successfully!" });
  });
});

module.exports = router;