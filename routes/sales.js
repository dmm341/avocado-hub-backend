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

  // Step 1: Record the sale
  const insertSaleQuery = `
    INSERT INTO sales (buyer_id, number_of_fruits, price_per_fruit, total_amount, sale_date)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(insertSaleQuery, [buyerId, numberOfFruits, pricePerFruit, totalAmount, saleDate], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to record sale." });

    // Step 2: Update the buyer's total fruits and total money
    const updateBuyerQuery = `
      UPDATE buyers
      SET total_fruits = total_fruits + ?, total_money = total_money + ?
      WHERE id = ?
    `;

    db.query(updateBuyerQuery, [numberOfFruits, totalAmount, buyerId], (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to update buyer." });

      res.status(201).json({ message: "Sale recorded and buyer updated successfully!" });
    });
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
  const { numberOfFruits, pricePerFruit, totalAmount } = req.body;

  if (!numberOfFruits || !pricePerFruit || !totalAmount) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Fetch the existing sale to calculate the difference
  const fetchSaleQuery = "SELECT buyer_id, number_of_fruits, total_amount FROM sales WHERE id = ?";
  db.query(fetchSaleQuery, [id], (err, saleResults) => {
    if (err) return res.status(500).json({ message: "Failed to fetch sale." });

    if (saleResults.length === 0) {
      return res.status(404).json({ message: "Sale not found." });
    }

    const existingSale = saleResults[0];
    const BuyerId = existingSale.buyer_id;

    // Calculate the difference
    const fruitDifference = numberOfFruits - existingSale.number_of_fruits;
    const moneyDifference = totalAmount - existingSale.total_amount;

    // Update the sale
    const updateSaleQuery = `
      UPDATE sales 
      SET  number_of_fruits = ?, price_per_fruit = ?, total_amount = ?
      WHERE id = ?
    `;
    
    db.query(updateSaleQuery, [ numberOfFruits, pricePerFruit, totalAmount, id], (err) => {
      if (err) return res.status(500).json({ message: "Failed to update sale." });

      const updateBuyerQuery = `
        UPDATE buyers
        SET total_fruits = total_fruits + ?, total_money = total_money + ?
        WHERE id = ?
      `;
      db.query(updateBuyerQuery, [fruitDifference, moneyDifference, BuyerId], (err) => {
        if (err) return res.status(500).json({ message: "Failed to update buyer." });
        res.status(200).json({ message: "Sale updated and buyer updated successfully!" });
      });
    });
  }); 
});
/** ============================
 *  DELETE SALE
 * ============================ */
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  // 1. First, fetch the sale details
  const fetchSaleQuery = `
    SELECT buyer_id, number_of_fruits, total_amount 
    FROM sales 
    WHERE id = ?
  `;

  db.query(fetchSaleQuery, [id], (err, saleResults) => {
    if (err) return res.status(500).json({ message: "Failed to fetch sale details." });
    
    if (saleResults.length === 0) {
      return res.status(404).json({ message: "Sale not found." });
    }

    const sale = saleResults[0];

    // 2. Delete the sale
    const deleteQuery = "DELETE FROM sales WHERE id = ?";
    db.query(deleteQuery, [id], (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to delete sale." });

      // 3. Update the buyer's totals
      const updateBuyerQuery = `
        UPDATE buyers 
        SET total_fruits = total_fruits - ?, 
            total_money = total_money - ? 
        WHERE id = ?
      `;

      db.query(updateBuyerQuery, [sale.number_of_fruits, sale.total_amount, sale.buyer_id], (err) => {
        if (err) {
          return res.status(500).json({ 
            message: "Sale deleted but failed to update buyer totals." 
          });
        }

        res.status(200).json({ 
          message: "Sale deleted and buyer totals updated successfully!" 
        });
      });
    });
  });
});
module.exports = router;