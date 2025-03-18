const express = require("express");
const db = require("../config/db");
const router = express.Router();

/** ============================
 *  CREATE NEW SALE
 * ============================ */
router.post("/", (req, res) => {
  const { buyerId, numberOfFruits, pricePerFruit, totalAmount, saleDate } = req.body;

  if (!buyerId || !numberOfFruits || !pricePerFruit || !totalAmount || !saleDate) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const query = "INSERT INTO sales (buyer_id, number_of_fruits, price_per_fruit, total_amount, sale_date) VALUES (?, ?, ?, ?, ?)";
  db.query(query, [buyerId, numberOfFruits, pricePerFruit, totalAmount, saleDate], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to record sale." });

    res.status(201).json({ message: "Sale recorded successfully!" });
  });
});

/** ============================
 *  GET ALL SALES
 * ============================ */
router.get("/", (req, res) => {
  const query = `
    SELECT sales.id, buyers.name AS buyer_name, sales.number_of_fruits, sales.price_per_fruit, sales.total_amount, sales.sale_date 
    FROM sales
    JOIN buyers ON sales.buyer_id = buyers.id
    ORDER BY sales.sale_date DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch sales." });
    res.json(results);
  });
});

/** ============================
 *  UPDATE SALE
 * ============================ */
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { numberOfFruits, pricePerFruit, totalAmount, saleDate } = req.body;

  if (!numberOfFruits || !pricePerFruit || !totalAmount || !saleDate) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const query = "UPDATE sales SET number_of_fruits = ?, price_per_fruit = ?, total_amount = ?, sale_date = ? WHERE id = ?";
  db.query(query, [numberOfFruits, pricePerFruit, totalAmount, saleDate, id], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to update sale." });

    res.status(200).json({ message: "Sale updated successfully!" });
  });
});

/** ============================
 *  DELETE SALE
 * ============================ */
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM sales WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to delete sale." });

    res.status(200).json({ message: "Sale deleted successfully!" });
  });
});

module.exports = router;
