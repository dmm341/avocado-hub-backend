const express = require("express");
const db = require("../config/db");
const router = express.Router();

/** ============================
 *  GET ALL FARMERS
 * ============================ */
router.get("/", (req, res) => {
  const query = "SELECT * FROM farmers";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

/** ============================
 *  GET FARMERS FOR DROPDOWN
 * ============================ */
router.get("/dropdown", (req, res) => {
  const query = "SELECT id, name FROM farmers ORDER BY name ASC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching farmers:", err);
      return res.status(500).json({ message: "Failed to fetch farmers." });
    }
    res.json(results);
  });
});

/** ============================
 *  ADD NEW FARMER
 * ============================ */
router.post("/", (req, res) => {
  const { name, contact, location, avocado_type, total_fruits, total_money } = req.body;
  const query = "INSERT INTO farmers (name, contact, location, avocado_type, total_fruits, total_money) VALUES (?, ?, ?, ?, ?, ?)";

  db.query(query, [name, contact, location, avocado_type, total_fruits, total_money], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Farmer added successfully!" });
  });
});

/** ============================
 *  UPDATE FARMER
 * ============================ */
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, contact, location, avocado_type, total_fruits, total_money } = req.body;
  const query = "UPDATE farmers SET name=?, contact=?, location=?, avocado_type=?, total_fruits=?, total_money=? WHERE id=?";
  
  db.query(query, [name, contact, location, avocado_type, total_fruits, total_money, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Farmer updated successfully!" });
  });
});

/** ============================
 *  DELETE FARMER
 * ============================ */
router.delete("/:id", (req, res) => {
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

module.exports = router;
